using HSMAPI.Contracts;
using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static HSMAPI.Services.WorkflowService;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/patients")]
public class PatientController(AppDBContext db, WorkflowService workflow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await db.Patients.Include(p => p.Person).AsNoTracking().ToListAsync()).Select(PatientView));
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var p = await db.Patients.Include(p => p.Person).SingleOrDefaultAsync(p => p.ID == id);
        return p is null ? NotFound(new { message = "Patient not found." }) : Ok(PatientView(p));
    }
    [HttpPost, Authorize(Roles = "Admin,Nurse,Doctor,Management")]
    public async Task<IActionResult> Create(PatientRequest request)
    {
        ValidateBirth(request);
        await workflow.CheckPerson(request.Email, request.ContactNumber);
        var p = new Patient { ID = Id(), Person = NewPerson(request.Name, request.Email, request.ContactNumber), CreatedBy = workflow.Actor };
        Apply(p, request); db.Patients.Add(p); await workflow.Save("Patient", "Create", p.ID);
        return CreatedAtAction(nameof(Get), new { id = p.ID }, PatientView(p));
    }
    [HttpPut("{id}"), Authorize(Roles = "Admin,Nurse,Doctor,Management")]
    public async Task<IActionResult> Update(string id, PatientRequest request)
    {
        var p = await db.Patients.Include(p => p.Person).SingleOrDefaultAsync(p => p.ID == id);
        if (p is null) return NotFound(new { message = "Patient not found." });
        ValidateBirth(request); await workflow.CheckPerson(request.Email, request.ContactNumber, p.PersonID);
        Apply(p, request); await workflow.Save("Patient", "Update", id); return Ok(PatientView(p));
    }
    private static void ValidateBirth(PatientRequest r) => Require(r.DateOfBirth != default && r.DateOfBirth <= DateOnly.FromDateTime(DateTime.UtcNow), "Invalid date of birth.");
    private static void Apply(Patient p, PatientRequest r)
    {
        p.Person.Name = r.Name.Trim(); p.Person.Email = r.Email.Trim().ToLowerInvariant(); p.Person.ContactNumber = r.ContactNumber;
        p.Person.DateOfBirth = r.DateOfBirth; p.Person.Gender = r.Gender; p.Person.Address = r.Address; p.MedicalHistory = r.MedicalHistory;
        p.Status = r.Status == "Active"; p.ClinicalStatus = r.Status; p.UpdatedOn = DateTime.UtcNow;
    }
    [HttpDelete("{id}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var p = await db.Patients.FindAsync(id); if (p is null) return NotFound();
        Require(!await db.Appointments.AnyAsync(x => x.PatientID == id) && !await db.Bills.AnyAsync(x => x.PatientID == id)
            && !await db.MedicalRecords.AnyAsync(x => x.PatientID == id) && !await db.Notifications.AnyAsync(x => x.PatientID == id),
            "Patient has linked records. Deactivate the patient instead.", 409);
        db.Patients.Remove(p); await workflow.Save("Patient", "Delete", id); return NoContent();
    }
}
