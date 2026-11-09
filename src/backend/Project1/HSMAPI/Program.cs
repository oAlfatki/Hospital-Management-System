using HSMBusiness;
using HSMBusiness.Erorrs;
using HSMBusiness.Services;
using HSMDataAccess.Data;
using HSMDataAccess.RepositoryServices;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.RateLimiting;

namespace HSMAPI;
public partial class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new HSMAPI.Contracts.TimeOnlyConverter()));
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddProblemDetails();
        var origins = builder.Configuration.GetSection("FrontendOrigins").Get<string[]>() ?? ["http://localhost:3000"];
        builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o =>
        {
            o.Cookie.Name = "hms_session";
            o.Cookie.HttpOnly = true;
            o.Cookie.SameSite = SameSiteMode.Strict;
            o.Cookie.SecurePolicy = builder.Environment.IsDevelopment() || builder.Environment.IsEnvironment("Testing")
                ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
            o.ExpireTimeSpan = TimeSpan.FromHours(8);
            o.Events.OnRedirectToLogin = c => { c.Response.StatusCode = 401; return Task.CompletedTask; };
            o.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = 403; return Task.CompletedTask; };
            o.Events.OnValidatePrincipal = async c =>
            {
                var users = c.HttpContext.RequestServices.GetRequiredService<UserService>();
                var id = c.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var user = string.IsNullOrEmpty(id) ? null : await users.GetActiveSessionAsync(id);
                if (user is null) { c.RejectPrincipal(); return; }
                var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, user.UserId), new Claim(ClaimTypes.Role, user.Role) }, CookieAuthenticationDefaults.AuthenticationScheme);
                c.ReplacePrincipal(new ClaimsPrincipal(identity));
            };
        });
        builder.Services.AddAuthorization(o => o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
        builder.Services.AddRateLimiter(o =>
        {
            o.RejectionStatusCode = 429;
            o.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
                { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
        });
        builder.Services.AddDbContext<AppDBContext>((services, options) =>
        {
            var config = services.GetRequiredService<IConfiguration>();
            var connection = config.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connection)) throw new InvalidOperationException("Set ConnectionStrings__DefaultConnection before starting the API.");
            if (config["Database:Provider"] == "Sqlite") options.UseSqlite(connection);
            else options.UseSqlServer(connection);
        });
        builder.Services.AddScoped<AppointmentRepository>();
        builder.Services.AddScoped<AppointmentError>();
        builder.Services.AddScoped<AppointmentService>();
        builder.Services.AddScoped<AuditLogRepository>();
        builder.Services.AddScoped<AuditLogService>();
        builder.Services.AddScoped<BillRepository>();
        builder.Services.AddScoped<HSMBusiness.Services.BillService>();
        builder.Services.AddScoped<BillServiceRepository>();
        builder.Services.AddScoped<BillServiceService>();
        builder.Services.AddScoped<DepartmentRepository>();
        builder.Services.AddScoped<DepartmentService>();
        builder.Services.AddScoped<DoctorRepository>();
        builder.Services.AddScoped<DoctorError>();
        builder.Services.AddScoped<DoctorService>();
        builder.Services.AddScoped<EmployeeRepository>();
        builder.Services.AddScoped<EmployeeService>();
        builder.Services.AddScoped<MedicalRecordRepository>();
        builder.Services.AddScoped<MedicalRecordService>();
        builder.Services.AddScoped<NotificationRepository>();
        builder.Services.AddScoped<NotificationService>();
        builder.Services.AddScoped<PatientRepository>();
        builder.Services.AddScoped<PatientService>();
        builder.Services.AddScoped<PersonRepository>();
        builder.Services.AddScoped<PersonService>();
        builder.Services.AddScoped<ReportRepository>();
        builder.Services.AddScoped<ReportService>();
        builder.Services.AddScoped<ServicesCategoryRepository>();
        builder.Services.AddScoped<ServicesCategoryService>();
        builder.Services.AddScoped<UserRepository>();
        builder.Services.AddScoped<UserError>();
        builder.Services.AddScoped<UserService>();

        var app = builder.Build();
        app.Use(async (context, next) =>
        {
            try { await next(); }
            catch (DbUpdateConcurrencyException) { await Results.Problem(statusCode: 409, title: "Data changed. Refresh before retrying.").ExecuteAsync(context); }
            catch (DbUpdateException e)
            {
                app.Logger.LogError(e, "Database update failed");
                await Results.Problem(statusCode: 409, title: "Data conflicts with an existing or linked record.").ExecuteAsync(context);
            }
            catch (Exception e)
            {
                app.Logger.LogError(e, "Request failed");
                await Results.Problem(statusCode: 500, title: "An unexpected server error occurred.").ExecuteAsync(context);
            }
        });
        if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
        if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing")) { app.UseHsts(); app.UseHttpsRedirection(); }
        app.UseCors();
        // Cookie-authenticated writes accept only configured browser origins.
        app.Use(async (context, next) =>
        {
            var origin = context.Request.Headers.Origin.ToString();
            if (origin.Length > 0 && !HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method)
                && !HttpMethods.IsOptions(context.Request.Method) && !origins.Contains(origin))
            { await Results.Problem(statusCode: 403, title: "Origin is not allowed.").ExecuteAsync(context); return; }
            await next();
        });
        app.UseAuthentication(); app.UseAuthorization(); app.UseRateLimiter();
        app.MapControllers();
        app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();
        if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Testing"))
        {
            using var scope = app.Services.CreateScope();
            var repositories = scope.ServiceProvider.GetRequiredService<UserRepository>();
            if (builder.Configuration.GetValue<bool>("Database:Initialize")) await repositories.InitializeDatabaseAsync();
            await scope.ServiceProvider.GetRequiredService<UserService>().EnsureDevelopmentAdministratorAsync(
                builder.Configuration["Bootstrap:Email"], builder.Configuration["Bootstrap:Password"]);
        }

        await app.RunAsync();
    }
}
