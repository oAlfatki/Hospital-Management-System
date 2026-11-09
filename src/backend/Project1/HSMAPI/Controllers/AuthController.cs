using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/auth")]
public class AuthController(UserService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await service.AuthenticateAsync(request);
        if (!result.IsSuccess || result.Data is null) return result.ToActionResult(this);
        var user = result.Data;
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.UserId), new Claim(ClaimTypes.Name, user.Name), new Claim(ClaimTypes.Role, user.Role) };
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
        return Ok(new { success = true, user });
    }
    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        var user = await service.GetActiveSessionAsync(Actor);
        return user is null ? Unauthorized() : Ok(user);
    }
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(); return NoContent();
    }
    [HttpGet("users"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> All() => (await service.GetStaffProfilesAsync()).ToActionResult(this);

    [HttpPost("register"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(StaffRequest request) => (await service.RegisterStaffAsync(request, Actor)).ToActionResult(this);

    [HttpPut("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, StaffRequest request) => (await service.UpdateStaffProfileAsync(id, request, Actor)).ToActionResult(this);
}
