using HSMAPI.Services;
using HSMDataAccess.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Admin,Management"), Route("api/notifications")]
public class NotificationController(AppDBContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await db.Notifications.AsNoTracking().ToListAsync()).Select(WorkflowService.NotificationView));
}
