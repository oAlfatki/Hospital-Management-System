using HSMBusiness;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMAPI.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Admin,Accounts,Management"), Route("api/billing")]
public class BillController(BillService service) : ControllerBase
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<IActionResult> All() =>
        (await service.GetInvoiceProfilesAsync()).ToActionResult(this);

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id) =>
        (await service.GetInvoiceProfileAsync(id)).ToActionResult(this);

    [HttpPost]
    public async Task<IActionResult> Create(BillRequest request) =>
        (await service.CreateInvoiceAsync(request, Actor)).ToActionResult(this);

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, BillRequest request) =>
        (await service.UpdateInvoiceAsync(id, request, Actor)).ToActionResult(this);

    [HttpPost("{id}/payments")]
    public async Task<IActionResult> Pay(string id, PaymentRequest request) =>
        (await service.RecordInvoicePaymentAsync(id, request, Actor)).ToActionResult(this);

    [HttpPost("{id}/reminders")]
    public async Task<IActionResult> Remind(string id) =>
        (await service.QueueInvoiceReminderAsync(id, Actor)).ToActionResult(this);

    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id) =>
        (await service.DeleteInvoiceAsync(id, Actor)).ToActionResult(this);

}
