using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/doctors")]
public class DoctorController(DoctorService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetDoctorProfilesAsync()).ToActionResult(this);

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id) =>
        (await service.GetDoctorProfileAsync(id)).ToActionResult(this);

    [HttpPost, Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Create(DoctorRequest request) =>
        (await service.RegisterDoctorAsync(request, Actor)).ToActionResult(this);

    [HttpPut("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Update(string id, DoctorRequest request) =>
        (await service.UpdateDoctorProfileAsync(id, request, Actor)).ToActionResult(this);

    [HttpDelete("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Delete(string id) =>
        (await service.DeleteDoctorProfileAsync(id, Actor)).ToActionResult(this);

}
