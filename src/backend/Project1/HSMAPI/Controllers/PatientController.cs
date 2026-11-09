using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/patients")]
public class PatientController(PatientService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetPatientProfilesAsync()).ToActionResult(this);

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id) =>
        (await service.GetPatientProfileAsync(id)).ToActionResult(this);

    [HttpPost, Authorize(Roles = "Admin,Nurse,Doctor,Management")]
    public async Task<IActionResult> Create(PatientRequest request) =>
        (await service.RegisterPatientAsync(request, Actor)).ToActionResult(this);

    [HttpPut("{id}"), Authorize(Roles = "Admin,Nurse,Doctor,Management")]
    public async Task<IActionResult> Update(string id, PatientRequest request) =>
        (await service.UpdatePatientProfileAsync(id, request, Actor)).ToActionResult(this);

    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id) =>
        (await service.DeletePatientProfileAsync(id, Actor)).ToActionResult(this);

}
