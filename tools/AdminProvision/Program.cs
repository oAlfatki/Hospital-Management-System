using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;

// Explicit maintenance command; never called during application startup.
var connection = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("Set ConnectionStrings__DefaultConnection.");
var email = Environment.GetEnvironmentVariable("HMS_ADMIN_EMAIL")?.Trim().ToLowerInvariant();
var password = Environment.GetEnvironmentVariable("HMS_ADMIN_PASSWORD");
if (!MailAddress.TryCreate(email, out _) || string.IsNullOrWhiteSpace(password) || password.Length < 12)
    throw new InvalidOperationException("Set HMS_ADMIN_EMAIL and HMS_ADMIN_PASSWORD (at least 12 characters).");
var options = new DbContextOptionsBuilder<AppDBContext>();
if (Environment.GetEnvironmentVariable("Database__Provider") == "Sqlite") options.UseSqlite(connection);
else options.UseSqlServer(connection);
await using var db = new AppDBContext(options.Options);
var user = await db.Users.Include(u => u.Person).SingleOrDefaultAsync(u => u.Person.Email == email);
if (user is null)
{
    if (await db.People.AnyAsync(p => p.Email == email)) throw new InvalidOperationException("Email is already assigned to a non-administrator person.");
    user = new User { ID = WorkflowService.Id(), Name = "Administrator", Role = "Admin", Status = true,
        Person = WorkflowService.NewPerson("Administrator", email!, null) };
    db.Users.Add(user);
}
if (user.Role.Trim() != "Admin") throw new InvalidOperationException("The selected user is not an administrator.");
user.PasswordHash = new PasswordHasher<User>().HashPassword(user, password);
user.Status = true;
user.UpdatedOn = DateTime.UtcNow;
db.AuditLogs.Add(new AuditLog { ID = WorkflowService.Id(), UserID = user.ID, Action = "Update", Entity = "User",
    Timestamp = DateTime.UtcNow, Details = "Administrator password provisioned by explicit maintenance command." });
await db.SaveChangesAsync();
Console.WriteLine("Administrator credentials updated. No password was logged.");
