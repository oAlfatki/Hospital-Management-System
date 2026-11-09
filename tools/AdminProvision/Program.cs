using HSMBusiness.Erorrs;
using HSMBusiness.Services;
using HSMDataAccess.Data;
using HSMDataAccess.RepositoryServices;
using Microsoft.EntityFrameworkCore;

var connection = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("Set ConnectionStrings__DefaultConnection.");
var options = new DbContextOptionsBuilder<AppDBContext>();
if (Environment.GetEnvironmentVariable("Database__Provider") == "Sqlite") options.UseSqlite(connection);
else options.UseSqlServer(connection);
await using var context = new AppDBContext(options.Options);
var personService = new PersonService(new PersonRepository(context));
var users = new UserService(new UserRepository(context), new UserError(personService), personService, new DoctorRepository(context));
var result = await users.ProvisionAdministratorAsync(
    Environment.GetEnvironmentVariable("HMS_ADMIN_EMAIL") ?? "",
    Environment.GetEnvironmentVariable("HMS_ADMIN_PASSWORD") ?? "");
if (!result.IsSuccess) throw new InvalidOperationException(result.Response);
Console.WriteLine("Administrator credentials updated. No password was logged.");
