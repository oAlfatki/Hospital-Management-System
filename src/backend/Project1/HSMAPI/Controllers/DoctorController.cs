using HSMAPI.Contracts;
using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static HSMAPI.Services.WorkflowService;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/doctors")]
public class DoctorController(AppDBContext db, WorkflowService workflow) : ControllerBase
{
    private IQueryable<Doctor> Query => db.Doctors.Include(x => x.Person).Include(x => x.User).ThenInclude(x => x.Person);
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await Query.AsNoTracking().ToListAsync()).Select(DoctorView));
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var d = await Query.SingleOrDefaultAsync(x => x.ID == id); return d is null ? NotFound() : Ok(DoctorView(d));
    }
    [HttpPost, Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Create(DoctorRequest r)
    {
        Require(await db.Departments.AnyAsync(x => x.ID == r.DepartmentId), "Department not found.", 404);
        var user = await db.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.Person.Email == r.Email.Trim().ToLowerInvariant());
        Person person;
        if (user is not null)
        {
            Require(user.Role.Trim() == "Doctor" && !await db.Doctors.AnyAsync(x => x.UserID == user.ID), "Email belongs to another staff account or registered doctor.", 409);
            await workflow.CheckPerson(r.Email, r.ContactNumber, user.PersonID); person = user.Person;
        }
        else { await workflow.CheckPerson(r.Email, r.ContactNumber); person = NewPerson(r.Name, r.Email, r.ContactNumber); }
        var d = new Doctor { ID = Id(), Person = person, UserID = user?.ID, CreatedBy = workflow.Actor };
        Apply(d, r); db.Doctors.Add(d); await workflow.Save("Doctor", "Create", d.ID);
        return CreatedAtAction(nameof(Get), new { id = d.ID }, DoctorView(d));
    }
    [HttpPut("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Update(string id, DoctorRequest r)
    {
        var d = await Query.SingleOrDefaultAsync(x => x.ID == id); if (d is null) return NotFound();
        Require(await db.Departments.AnyAsync(x => x.ID == r.DepartmentId), "Department not found.", 404);
        d.Person ??= d.User?.Person ?? NewPerson(r.Name, r.Email, r.ContactNumber);
        await workflow.CheckPerson(r.Email, r.ContactNumber, d.Person.ID);
        Require(!await db.Departments.AnyAsync(x => x.HeadOf == id && (x.ID != r.DepartmentId || r.Status != "Active")),
            "Assign another department head before moving or deactivating this doctor.", 409);
        Apply(d, r); await workflow.Save("Doctor", "Update", id); return Ok(DoctorView(d));
    }
    private static void Apply(Doctor d, DoctorRequest r)
    {
        d.Person.Name = r.Name.Trim(); d.Person.Email = r.Email.Trim().ToLowerInvariant(); d.Person.ContactNumber = r.ContactNumber;
        d.DepartmentID = r.DepartmentId; d.Specialization = r.Specialty.Trim(); d.Status = r.Status == "Active"; d.UpdatedOn = DateTime.UtcNow;
    }
    [HttpDelete("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Delete(string id)
    {
        var d = await db.Doctors.FindAsync(id); if (d is null) return NotFound();
        Require(!await db.Appointments.AnyAsync(x => x.DoctorID == id) && !await db.Departments.AnyAsync(x => x.HeadOf == id), "Doctor is linked to appointments or heads a department.", 409);
        db.Doctors.Remove(d); await workflow.Save("Doctor", "Delete", id); return NoContent();
    }
}
