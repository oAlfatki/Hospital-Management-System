using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/appointments")]
public class AppointmentController(AppointmentService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetAppointmentProfilesAsync()).ToActionResult(this);

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id) =>
        (await service.GetAppointmentProfileAsync(id)).ToActionResult(this);

    [HttpPost, Authorize(Roles = "Admin,Doctor,Nurse,Management")]
    public async Task<IActionResult> Create(AppointmentRequest request) =>
        (await service.ScheduleAppointmentAsync(request, Actor)).ToActionResult(this);

    [HttpPatch("{id}/status"), Authorize(Roles = "Admin,Doctor,Nurse,Management")]
    public async Task<IActionResult> Status(string id, AppointmentStatusRequest request) =>
        (await service.ChangeAppointmentStatusAsync(id, request, Actor)).ToActionResult(this);

    [HttpPatch("{id}/reschedule"), Authorize(Roles = "Admin,Doctor,Nurse,Management")]
    public async Task<IActionResult> Reschedule(string id, RescheduleRequest request) =>
        (await service.RescheduleAppointmentAsync(id, request, Actor)).ToActionResult(this);

    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id) =>
        (await service.DeleteAppointmentAsync(id, Actor)).ToActionResult(this);

}
