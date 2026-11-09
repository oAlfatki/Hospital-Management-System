using HSMAPI.Contracts;
using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static HSMAPI.Services.WorkflowService;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/auth")]
public class AuthController(AppDBContext db, WorkflowService workflow, PasswordHasher<User> hasher) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var u = await db.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.Person.Email == email);
        var valid = false;
        if (u is not null && u.Status)
        {
            try { valid = hasher.VerifyHashedPassword(u, u.PasswordHash, request.Password) != PasswordVerificationResult.Failed; }
            catch (FormatException) { /* Legacy plaintext credentials require an administrator password reset. */ }
        }
        if (!valid || u is null) return Unauthorized(new { message = "Invalid email or password.", success = false });
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, u.ID.Trim()), new Claim(ClaimTypes.Name, u.Person.Name), new Claim(ClaimTypes.Role, u.Role.Trim()) };
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
        return Ok(new { success = true, user = UserView(u) });
    }
    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        var u = await db.Users.Include(x => x.Person).SingleAsync(x => x.ID == workflow.Actor);
        return Ok(UserView(u));
    }
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(); return NoContent();
    }
    [HttpGet("users"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> All() => Ok((await db.Users.Include(x => x.Person).AsNoTracking().ToListAsync()).Select(UserView));
    [HttpPost("register"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(StaffRequest r)
    {
        Require(!string.IsNullOrWhiteSpace(r.Password) && r.Password.Length >= 12, "An initial password of at least 12 characters is required.");
        var existingPerson = await db.People.SingleOrDefaultAsync(x => x.Email == r.Email.Trim().ToLowerInvariant());
        Doctor? doctor = null;
        if (existingPerson is not null)
        {
            doctor = await db.Doctors.SingleOrDefaultAsync(x => x.PersonID == existingPerson.ID && x.UserID == null);
            Require(r.Role == "Doctor" && doctor is not null, "Email is already registered.", 409);
        }
        await workflow.CheckPerson(r.Email, r.ContactNumber, existingPerson?.ID);
        var u = new User { ID = Id(), Person = existingPerson ?? NewPerson(r.Name, r.Email, r.ContactNumber), Name = r.Name.Trim(),
            Role = r.Role, Status = r.Status == "Active", DepartmentName = r.Department, CreatedBy = workflow.Actor };
        u.Person.Name = r.Name.Trim();
        if (!string.IsNullOrWhiteSpace(r.ContactNumber)) u.Person.ContactNumber = r.ContactNumber;
        u.PasswordHash = hasher.HashPassword(u, r.Password!); db.Users.Add(u);
        if (doctor is not null) doctor.User = u;
        await workflow.Save("User", "Create", u.ID); return StatusCode(201, UserView(u));
    }
    [HttpPut("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, StaffRequest r)
    {
        var u = await db.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.ID == id); if (u is null) return NotFound();
        Require(id != workflow.Actor || (r.Role == "Admin" && r.Status == "Active"), "You cannot remove your own administrator access.", 409);
        await workflow.CheckPerson(r.Email, r.ContactNumber, u.PersonID);
        u.Name = r.Name.Trim(); u.Person.Name = u.Name; u.Person.Email = r.Email.Trim().ToLowerInvariant();
        u.Person.ContactNumber = string.IsNullOrWhiteSpace(r.ContactNumber) ? null! : r.ContactNumber; u.Role = r.Role; u.Status = r.Status == "Active";
        u.DepartmentName = r.Department; u.UpdatedOn = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(r.Password)) u.PasswordHash = hasher.HashPassword(u, r.Password);
        await workflow.Save("User", "Update", id); return Ok(UserView(u));
    }
}
