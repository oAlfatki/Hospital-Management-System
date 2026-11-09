using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Doctor,Nurse"), Route("api/records")]
public class MedicalRecordController(MedicalRecordService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetClinicalProfilesAsync()).ToActionResult(this);

    [HttpPost]
    public async Task<IActionResult> Create(RecordRequest request) =>
        (await service.CreateClinicalRecordAsync(request, Actor)).ToActionResult(this);

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, [FromQuery] int version) =>
        (await service.DeleteClinicalRecordAsync(id, version, Actor)).ToActionResult(this);

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, RecordUpdateRequest request) =>
        (await service.UpdateClinicalRecordAsync(id, request, Actor)).ToActionResult(this);

}
