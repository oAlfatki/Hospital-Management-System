using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/departments")]
public class DepartmentController(DepartmentService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetDepartmentProfilesAsync()).ToActionResult(this);

    [HttpPost, Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Create(DepartmentRequest request) =>
        (await service.CreateDepartmentAsync(request, Actor)).ToActionResult(this);

    [HttpPut("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Update(string id, DepartmentRequest request) =>
        (await service.UpdateDepartmentAsync(id, request, Actor)).ToActionResult(this);

    [HttpDelete("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Delete(string id) =>
        (await service.DeleteDepartmentAsync(id, Actor)).ToActionResult(this);

}
