using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/dashboard")]
public class DashboardController(ReportService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() =>
        (await service.GetDashboardAsync(User.FindFirstValue(ClaimTypes.Role) ?? "")).ToActionResult(this);

}
