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
    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetNotificationProfilesAsync()).ToActionResult(this);

}
