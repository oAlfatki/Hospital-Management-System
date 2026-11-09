using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using HSMAPI;
using HSMDataAccess.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace HSMAPI.Tests;

public sealed class HospitalFactory : WebApplicationFactory<Program>
{
    private readonly string? sqlConnection = Environment.GetEnvironmentVariable("HMS_TEST_SQLSERVER_CONNECTION");
    private readonly string sqlDatabase = "hms_test_" + Guid.NewGuid().ToString("N");
    private readonly string database = Path.Combine(Path.GetTempPath(), $"hms-test-{Guid.NewGuid():N}.db");
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, c) => c.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Database:Provider"] = string.IsNullOrEmpty(sqlConnection) ? "Sqlite" : "SqlServer", ["Database:Initialize"] = "true",
            ["ConnectionStrings:DefaultConnection"] = string.IsNullOrEmpty(sqlConnection)
                ? $"Data Source={database};Pooling=False"
                : new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(sqlConnection) { InitialCatalog = sqlDatabase, Pooling = false }.ConnectionString,
            ["Bootstrap:Email"] = "admin@example.test", ["Bootstrap:Password"] = WorkflowTests.Password
        }));
    }
    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && File.Exists(database)) File.Delete(database);
        if (disposing && !string.IsNullOrEmpty(sqlConnection))
        {
            var connection = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(sqlConnection) { InitialCatalog = sqlDatabase, Pooling = false }.ConnectionString;
            using var db = new AppDBContext(new DbContextOptionsBuilder<AppDBContext>().UseSqlServer(connection).Options);
            db.Database.EnsureDeleted();
        }
    }
}

public class WorkflowTests
{
    public const string Password = "Integration-Only-Password-37!";
    private static async Task<JsonElement> Read(HttpResponseMessage response, HttpStatusCode expected = HttpStatusCode.OK)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == expected, $"Expected {expected}, received {response.StatusCode}: {body}");
        return JsonDocument.Parse(body).RootElement.Clone();
    }
    private static async Task Login(HttpClient c, string email = "admin@example.test") =>
        await Read(await c.PostAsJsonAsync("/api/auth/login", new { email, password = Password }));
    private static object Patient(string suffix = "1") => new { name = "Patient " + suffix, email = $"patient{suffix}@example.test",
        dateOfBirth = "1994-05-15", gender = "Other", contactNumber = "051234567" + suffix,
        address = "Riyadh", medicalHistory = "", status = "Active" };
    private static async Task<string> CreatePatient(HttpClient c, string suffix = "1") =>
        (await Read(await c.PostAsJsonAsync("/api/patients", Patient(suffix)), HttpStatusCode.Created)).GetProperty("patientId").GetString()!;
    private static object Staff(string role, string email) => new { name = role + " Staff", email, role, status = "Active", password = Password };

    [Fact]
    public async Task SessionsAreVerifiedAndSensitiveDataIsNeverReturned()
    {
        using var app = new HospitalFactory(); using var c = app.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/patients")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.PostAsJsonAsync("/api/auth/login", new { email = "admin@example.test", password = "wrong" })).StatusCode);
        await Login(c);
        var session = await Read(await c.GetAsync("/api/auth/session"));
        Assert.Equal("admin@example.test", session.GetProperty("email").GetString());
        Assert.DoesNotContain("password", (await c.GetStringAsync("/api/auth/users")).ToLowerInvariant());
        Assert.Equal(HttpStatusCode.NoContent, (await c.PostAsync("/api/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/auth/session")).StatusCode);
    }

    [Fact]
    public async Task PatientCreationAndEditingAreAtomicAndMatchTheUiContract()
    {
        using var app = new HospitalFactory(); using var c = app.CreateClient(); await Login(c);
        var id = await CreatePatient(c);
        var patient = await Read(await c.GetAsync($"/api/patients/{id}"));
        Assert.Equal("Patient 1", patient.GetProperty("name").GetString());
        Assert.Equal("Other", patient.GetProperty("gender").GetString());
        Assert.Equal("", patient.GetProperty("medicalHistory").GetString());
        Assert.Equal(HttpStatusCode.Conflict, (await c.PostAsJsonAsync("/api/patients", Patient())).StatusCode);
        var edit = new { name = "Updated Patient", email = "patient1@example.test", dateOfBirth = "1994-05-15", gender = "Prefer not to say",
            contactNumber = "0512345671", address = "Jeddah", medicalHistory = "History", status = "Deceased" };
        var changed = await Read(await c.PutAsJsonAsync($"/api/patients/{id}", edit));
        Assert.Equal("Deceased", changed.GetProperty("status").GetString());
        Assert.Equal("Jeddah", changed.GetProperty("address").GetString());
        var list = await Read(await c.GetAsync("/api/patients")); Assert.Equal(1, list.GetArrayLength());
        for (var i = 0; i < 12; i++) Assert.Equal(HttpStatusCode.OK, (await c.GetAsync("/api/patients")).StatusCode);
        var invalid = await c.PostAsJsonAsync("/api/patients", new { name = "x" }); Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    [Fact]
    public async Task MultipleDoctorsCanShareADepartmentAndAppointmentsDetectOverlaps()
    {
        using var app = new HospitalFactory(); using var c = app.CreateClient(); await Login(c);
        var patient = await CreatePatient(c);
        var dept = await Read(await c.PostAsJsonAsync("/api/departments", new { name = "Cardiology", description = "Heart clinic" }), HttpStatusCode.Created);
        var departmentId = dept.GetProperty("departmentId").GetString();
        string? firstDoctor = null;
        for (var i = 2; i <= 3; i++)
        {
            var doctor = await Read(await c.PostAsJsonAsync("/api/doctors", new { name = $"Doctor {i}", email = $"doctor{i}@example.test",
                contactNumber = $"051234567{i}", departmentId, specialty = "Cardiology", status = "Active" }), HttpStatusCode.Created);
            firstDoctor ??= doctor.GetProperty("doctorId").GetString();
        }
        var day = DateTime.Today.AddDays(2).ToString("yyyy-MM-dd");
        object Appointment(string time) => new { patientId = patient, doctorId = firstDoctor, appointmentDate = day, appointmentTime = time, durationMinutes = 30 };
        var created = await Read(await c.PostAsJsonAsync("/api/appointments", Appointment("10:00")), HttpStatusCode.Created);
        var id = created.GetProperty("appointmentId").GetString();
        Assert.Equal(HttpStatusCode.Conflict, (await c.PostAsJsonAsync("/api/appointments", Appointment("10:15"))).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await c.PostAsJsonAsync("/api/appointments", Appointment("10:30"))).StatusCode);
        var moved = await Read(await c.PatchAsJsonAsync($"/api/appointments/{id}/reschedule", new { newDate = day, newTime = "11:00" }));
        Assert.Equal("Rescheduled", moved.GetProperty("status").GetString());
        Assert.Equal(patient, moved.GetProperty("patientId").GetString());
        Assert.Equal(30, moved.GetProperty("durationMinutes").GetInt32());
        await Read(await c.PatchAsJsonAsync($"/api/appointments/{id}/status", new { status = "Cancelled" }));
        Assert.Equal(HttpStatusCode.Conflict, (await c.PatchAsJsonAsync($"/api/appointments/{id}/reschedule", new { newDate = day, newTime = "12:00" })).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await c.PostAsJsonAsync("/api/appointments", Appointment("11:00"))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await c.DeleteAsync($"/api/patients/{patient}")).StatusCode);
    }

    [Fact]
    public async Task BillsPersistLinesAndAccumulatePaymentsWithoutPrematurePaidStatus()
    {
        using var app = new HospitalFactory(); using var c = app.CreateClient(); await Login(c);
        var patient = await CreatePatient(c);
        var bill = await Read(await c.PostAsJsonAsync("/api/billing", new { patientId = patient,
            services = new[] { new { serviceName = "Consultation", cost = 100m }, new { serviceName = "Lab", cost = 50m } },
            taxPercent = 15m, discountAmount = 10m, dueDate = DateTime.Today.AddDays(7).ToString("yyyy-MM-dd") }), HttpStatusCode.Created);
        var id = bill.GetProperty("billId").GetString();
        Assert.Equal(162.50m, bill.GetProperty("totalAmount").GetDecimal());
        var partial = await Read(await c.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 60m }));
        Assert.Equal("Pending", partial.GetProperty("status").GetString()); Assert.Equal(102.50m, partial.GetProperty("pendingDue").GetDecimal());
        var reminder = await Read(await c.PostAsync($"/api/billing/{id}/reminders", null), HttpStatusCode.Accepted);
        Assert.Equal(patient, reminder.GetProperty("patientId").GetString()); Assert.Equal("Pending", reminder.GetProperty("status").GetString());
        Assert.False(reminder.GetProperty("deliveryConfirmation").GetBoolean());
        Assert.Equal(HttpStatusCode.Conflict, (await c.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 200m })).StatusCode);
        var paid = await Read(await c.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 102.50m }));
        Assert.Equal("Paid", paid.GetProperty("status").GetString()); Assert.Equal(162.50m, paid.GetProperty("paidAmount").GetDecimal());
        Assert.Equal(2, (await Read(await c.GetAsync($"/api/billing/{id}"))).GetProperty("services").GetArrayLength());
        Assert.Equal(HttpStatusCode.Conflict, (await c.DeleteAsync($"/api/billing/{id}")).StatusCode);
        var dashboard = await Read(await c.GetAsync("/api/dashboard"));
        Assert.Equal(162.50m, dashboard.GetProperty("stats").GetProperty("monthlyRevenue").GetDecimal());
        Assert.Equal(0, dashboard.GetProperty("stats").GetProperty("pendingDues").GetDecimal());
    }

    [Fact]
    public async Task ClinicalRecordsKeepHistoryRejectStaleEditsAndEnforceServerRoles()
    {
        using var app = new HospitalFactory(); using var admin = app.CreateClient(); await Login(admin);
        var patient = await CreatePatient(admin);
        await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Doctor", "clinical@example.test")), HttpStatusCode.Created);
        await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Nurse", "nurse@example.test")), HttpStatusCode.Created);
        Assert.Equal(HttpStatusCode.Forbidden, (await admin.GetAsync("/api/records")).StatusCode);
        using var c = app.CreateClient(); await Login(c, "clinical@example.test");
        var record = await Read(await c.PostAsJsonAsync("/api/records", new { patientId = patient, diagnosis = "Initial diagnosis", treatment = "Initial treatment", prescriptions = "", status = "Active" }), HttpStatusCode.Created);
        var id = record.GetProperty("recordId").GetString();
        var edit = new { diagnosis = "Updated diagnosis", treatment = "Follow up", prescriptions = "Medication", status = "Active", version = 1 };
        var updated = await Read(await c.PutAsJsonAsync($"/api/records/{id}", edit));
        Assert.Equal(2, updated.GetProperty("version").GetInt32()); Assert.Equal(2, updated.GetProperty("history").GetArrayLength());
        Assert.Equal(HttpStatusCode.Conflict, (await c.PutAsJsonAsync($"/api/records/{id}", edit)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await c.GetAsync("/api/billing")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await c.GetAsync("/api/auth/users")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await c.GetAsync("/api/PersonController/All")).StatusCode);
        var dashboard = await Read(await c.GetAsync("/api/dashboard")); Assert.False(dashboard.GetProperty("financeVisible").GetBoolean());
        Assert.Equal(JsonValueKind.Null, dashboard.GetProperty("stats").GetProperty("monthlyRevenue").ValueKind);
        Assert.True((await Read(await admin.GetAsync("/api/audit"))).GetArrayLength() >= 5);
    }

    [Fact]
    public async Task DisabledAccountsLoseExistingSessionsAndForeignOriginsAreRejected()
    {
        using var app = new HospitalFactory(); using var admin = app.CreateClient(); await Login(admin);
        var staff = await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Nurse", "nurse@example.test")), HttpStatusCode.Created);
        using var nurse = app.CreateClient(); await Login(nurse, "nurse@example.test");
        Assert.Equal(HttpStatusCode.OK, (await nurse.GetAsync("/api/auth/session")).StatusCode);
        var id = staff.GetProperty("userId").GetString();
        await Read(await admin.PutAsJsonAsync($"/api/auth/{id}", new { name = "Nurse Staff", email = "nurse@example.test", role = "Nurse", status = "Inactive" }));
        Assert.Equal(HttpStatusCode.Unauthorized, (await nurse.GetAsync("/api/auth/session")).StatusCode);
        using var message = new HttpRequestMessage(HttpMethod.Post, "/api/patients") { Content = JsonContent.Create(Patient()) };
        message.Headers.Add("Origin", "https://untrusted.example");
        Assert.Equal(HttpStatusCode.Forbidden, (await admin.SendAsync(message)).StatusCode);
    }

    [Fact]
    public async Task LoginRateLimitDoesNotReportSuccessForBlockedRequests()
    {
        using var app = new HospitalFactory(); using var c = app.CreateClient();
        for (var i = 0; i < 10; i++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await c.PostAsJsonAsync("/api/auth/login", new { email = "nobody@example.test", password = "wrong" })).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await c.PostAsJsonAsync("/api/auth/login", new { email = "admin@example.test", password = Password })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await c.GetAsync("/health")).StatusCode);
    }

    [Fact]
    public async Task ADoctorProfileCanBeLinkedToALoginCreatedLater()
    {
        using var app = new HospitalFactory(); using var c = app.CreateClient(); await Login(c);
        var dept = await Read(await c.PostAsJsonAsync("/api/departments", new { name = "Neurology" }), HttpStatusCode.Created);
        var doctor = await Read(await c.PostAsJsonAsync("/api/doctors", new { name = "Clinical Doctor", email = "linked@example.test", contactNumber = "0559876543",
            departmentId = dept.GetProperty("departmentId").GetString(), specialty = "Neurology", status = "Active" }), HttpStatusCode.Created);
        await Read(await c.PostAsJsonAsync("/api/auth/register", Staff("Doctor", "linked@example.test")), HttpStatusCode.Created);
        using var login = app.CreateClient(); await Login(login, "linked@example.test");
        var profile = await Read(await login.GetAsync("/api/doctors/" + doctor.GetProperty("doctorId").GetString()));
        Assert.Equal("linked@example.test", profile.GetProperty("email").GetString());
        Assert.Equal("0559876543", profile.GetProperty("contactNumber").GetString());
    }

    [Fact]
    public void SqlServerModelBuildsWithManyDoctorsAndConcurrencyTokens()
    {
        using var db = new AppDBContext(new DbContextOptionsBuilder<AppDBContext>().UseSqlServer("Server=unused;Database=unused;Integrated Security=true").Options);
        var sql = db.Database.GenerateCreateScript();
        Assert.Contains("CREATE TABLE [BillLines]", sql); Assert.Contains("CREATE TABLE [Payments]", sql);
        var doctor = db.Model.FindEntityType(typeof(HSMDataAccess.Entities.Doctor))!;
        Assert.False(doctor.GetForeignKeys().Single(x => x.Properties.Any(p => p.Name == "DepartmentID")).IsUnique);
        var notification = db.Model.FindEntityType(typeof(HSMDataAccess.Entities.Notification))!;
        Assert.Equal("PatientID", notification.GetForeignKeys().Single(x => x.PrincipalEntityType.ClrType == typeof(HSMDataAccess.Entities.Patient)).Properties.Single().Name);
        Assert.True(db.Model.FindEntityType(typeof(HSMDataAccess.Entities.Bill))!.FindProperty("Revision")!.IsConcurrencyToken);
    }
}
