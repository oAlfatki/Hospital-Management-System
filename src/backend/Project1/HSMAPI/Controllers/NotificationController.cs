using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Admin,Management"), Route("api/notifications")]
public class NotificationController(NotificationService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, NotificationUpdateRequest request) =>
        (await service.UpdatePendingNotificationAsync(id, request, Actor)).ToActionResult(this);
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) =>
        (await service.DeletePendingNotificationAsync(id, Actor)).ToActionResult(this);
    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetNotificationProfilesAsync()).ToActionResult(this);

}
