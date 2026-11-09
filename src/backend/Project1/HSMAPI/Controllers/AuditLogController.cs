using HSMDataAccess.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Admin,Management"), Route("api/audit")]
public class AuditLogController(AppDBContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> All() => Ok(await db.AuditLogs.AsNoTracking().OrderByDescending(x => x.Timestamp)
        .Select(x => new { auditId = x.ID.Trim(), userId = x.UserID.Trim(), userName = x.user.Person.Name,
            entity = x.Entity, action = x.Action.Trim(), x.Timestamp, x.Details }).ToListAsync());
}
