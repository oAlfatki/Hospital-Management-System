using HSMAPI.Contracts;
using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using static HSMAPI.Services.WorkflowService;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Admin,Accounts,Management"), Route("api/billing")]
public class BillController(AppDBContext db, WorkflowService workflow) : ControllerBase
{
    private IQueryable<Bill> Query => db.Bills.Include(x => x.Lines).Include(x => x.Payments);
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await Query.AsNoTracking().ToListAsync()).Select(BillView));
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var b = await Query.SingleOrDefaultAsync(x => x.ID == id); return b is null ? NotFound() : Ok(BillView(b));
    }
    [HttpPost]
    public async Task<IActionResult> Create(BillRequest r)
    {
        Require(await db.Patients.AnyAsync(x => x.ID == r.PatientId && x.Status), "Active patient not found.", 404);
        Require(r.DueDate >= DateOnly.FromDateTime(DateTime.UtcNow), "Due date cannot be in the past.");
        var subtotal = r.Services.Sum(s => Money(s.Cost));
        var discount = Money(r.DiscountAmount);
        var taxPercent = Money(r.TaxPercent);
        var total = Money(subtotal + Money(subtotal * taxPercent / 100) - discount);
        Require(subtotal <= 99999999 && total <= 99999999 && total > 0 && discount <= subtotal, "Discount must not exceed subtotal and total must be positive.");
        var b = new Bill { ID = Id(), PatientID = r.PatientId, Status = "Unpaid", Date = DateTime.UtcNow,
            DueDate = r.DueDate.ToDateTime(TimeOnly.MinValue), Invoice = $"INV-{Guid.NewGuid():N}", GrossAmount = subtotal,
            Discount = discount, TaxPercent = taxPercent, PatientResponsibility = total,
            PartialPaymentAmount = 0, CreatedBy = workflow.Actor,
            Lines = r.Services.Select(s => new BillLine { ServiceName = s.ServiceName.Trim(), Cost = Money(s.Cost) }).ToList() };
        db.Bills.Add(b); await workflow.Save("Billing", "Create", b.ID);
        return CreatedAtAction(nameof(Get), new { id = b.ID }, BillView(b));
    }
    [HttpPost("{id}/payments")]
    public async Task<IActionResult> Pay(string id, PaymentRequest r)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var b = await Query.SingleOrDefaultAsync(x => x.ID == id); if (b is null) return NotFound();
        var amount = Money(r.AmountToPay); var paid = b.PartialPaymentAmount ?? 0;
        Require(b.Status != "Cancelled" && amount > 0 && amount <= Money(b.PatientResponsibility - paid), "Payment exceeds outstanding balance or invoice is cancelled.", 409);
        b.PartialPaymentAmount = paid + amount; b.Status = b.PartialPaymentAmount == b.PatientResponsibility ? "Paid" : "Partially Paid";
        b.Revision++; b.UpdatedOn = DateTime.UtcNow; b.Payments.Add(new Payment { Amount = amount });
        await workflow.Save("Billing", "Update", id); await transaction.CommitAsync(); return Ok(BillView(b));
    }
    [HttpPost("{id}/reminders")]
    public async Task<IActionResult> Remind(string id)
    {
        var b = await db.Bills.FindAsync(id); if (b is null) return NotFound();
        Require(b.Status != "Cancelled" && b.PatientResponsibility > (b.PartialPaymentAmount ?? 0), "Invoice is already paid.", 409);
        // Queue only. A provider worker must update status after actual delivery.
        var n = new Notification { ID = Id(), PatientID = b.PatientID, UserID = workflow.Actor, Type = "Email",
            Message = $"Payment reminder for invoice {b.Invoice}", Status = "Pending", DeliveryConfirmation = false };
        db.Notifications.Add(n); await workflow.Save("Notification", "Create", n.ID); return Accepted(NotificationView(n));
    }
    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var b = await Query.SingleOrDefaultAsync(x => x.ID == id); if (b is null) return NotFound();
        Require((b.PartialPaymentAmount ?? 0) == 0, "Invoices with payments cannot be deleted.", 409);
        db.Bills.Remove(b); await workflow.Save("Billing", "Delete", id); return NoContent();
    }
}
