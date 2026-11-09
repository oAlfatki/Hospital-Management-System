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

[ApiController, Authorize, Route("api/appointments")]
public class AppointmentController(AppDBContext db, WorkflowService workflow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await db.Appointments.AsNoTracking().ToListAsync()).Select(AppointmentView));
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var a = await db.Appointments.FindAsync(id); return a is null ? NotFound() : Ok(AppointmentView(a));
    }
    [HttpPost, Authorize(Roles = "Admin,Doctor,Nurse,Management")]
    public async Task<IActionResult> Create(AppointmentRequest r)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        Require(await db.Patients.AnyAsync(p => p.ID == r.PatientId && p.Status), "Active patient not found.", 404);
        Require(await db.Doctors.AnyAsync(d => d.ID == r.DoctorId && d.Status), "Active doctor not found.", 404);
        var a = new Appointment { ID = Id(), PatientID = r.PatientId, DoctorID = r.DoctorId, Date = r.AppointmentDate,
            Time = r.AppointmentTime, Duration = r.DurationMinutes, Status = "Scheduled", NotificationSent = false, CreatedBy = workflow.Actor };
        await ValidateSlot(a); db.Appointments.Add(a); await workflow.Save("Appointment", "Create", a.ID);
        await transaction.CommitAsync(); return CreatedAtAction(nameof(Get), new { id = a.ID }, AppointmentView(a));
    }
    [HttpPatch("{id}/status"), Authorize(Roles = "Admin,Doctor,Nurse,Management")]
    public async Task<IActionResult> Status(string id, AppointmentStatusRequest r)
    {
        var a = await db.Appointments.FindAsync(id); if (a is null) return NotFound();
        Require(r.Status == "Cancelled", "Use the reschedule operation to change appointment time.");
        a.Status = "Cancelled"; a.UpdatedOn = DateTime.UtcNow;
        await workflow.Save("Appointment", "Update", id); return Ok(AppointmentView(a));
    }
    [HttpPatch("{id}/reschedule"), Authorize(Roles = "Admin,Doctor,Nurse,Management")]
    public async Task<IActionResult> Reschedule(string id, RescheduleRequest r)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var a = await db.Appointments.FindAsync(id); if (a is null) return NotFound();
        Require(a.Status != "Cancelled", "Cancelled appointments cannot be rescheduled.", 409);
        a.Date = r.NewDate; a.Time = r.NewTime; a.Status = "Rescheduled"; a.NotificationSent = false; a.UpdatedOn = DateTime.UtcNow;
        await ValidateSlot(a); await workflow.Save("Appointment", "Update", id);
        await transaction.CommitAsync(); return Ok(AppointmentView(a));
    }
    private async Task ValidateSlot(Appointment a)
    {
        Require(a.Time.HasValue && a.Date != default, "Appointment date and time are required.");
        var start = a.Date.ToDateTime(a.Time!.Value); Require(start > DateTime.Now, "Appointment must be in the future.");
        var end = start.AddMinutes(a.Duration); Require(end.Date == start.Date, "Appointment must end on the same day.");
        var others = await db.Appointments.Where(x => x.ID != a.ID && x.Date == a.Date && x.Status != "Cancelled"
            && (x.DoctorID == a.DoctorID || x.PatientID == a.PatientID)).ToListAsync();
        Require(!others.Any(x => x.Time.HasValue && start < x.Date.ToDateTime(x.Time.Value).AddMinutes(x.Duration)
            && end > x.Date.ToDateTime(x.Time.Value)), "Doctor or patient already has an overlapping appointment.", 409);
    }
    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var a = await db.Appointments.FindAsync(id); if (a is null) return NotFound();
        db.Appointments.Remove(a); await workflow.Save("Appointment", "Delete", id); return NoContent();
    }
}
