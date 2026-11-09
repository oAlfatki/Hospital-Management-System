using HSMAPI.Contracts;
using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static HSMAPI.Services.WorkflowService;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/departments")]
public class DepartmentController(AppDBContext db, WorkflowService workflow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await db.Departments.AsNoTracking().ToListAsync()).Select(DepartmentView));
    [HttpPost, Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Create(DepartmentRequest r)
    {
        Require(string.IsNullOrWhiteSpace(r.HeadOfDepartment), "Create the department before assigning its head.");
        var d = new Department { ID = Id(), Name = r.Name.Trim(), Description = r.Description, CreatedBy = workflow.Actor };
        db.Departments.Add(d); await workflow.Save("Department", "Create", d.ID); return StatusCode(201, DepartmentView(d));
    }
    [HttpPut("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Update(string id, DepartmentRequest r)
    {
        var d = await db.Departments.FindAsync(id); if (d is null) return NotFound();
        if (!string.IsNullOrWhiteSpace(r.HeadOfDepartment))
            Require(await db.Doctors.AnyAsync(x => x.ID == r.HeadOfDepartment && x.DepartmentID == id && x.Status), "Head must be an active doctor in this department.");
        d.Name = r.Name.Trim(); d.Description = r.Description; d.HeadOf = string.IsNullOrWhiteSpace(r.HeadOfDepartment) ? null : r.HeadOfDepartment;
        d.UpdatedOn = DateTime.UtcNow; await workflow.Save("Department", "Update", id); return Ok(DepartmentView(d));
    }
    [HttpDelete("{id}"), Authorize(Roles = "Admin,Management")]
    public async Task<IActionResult> Delete(string id)
    {
        var d = await db.Departments.FindAsync(id); if (d is null) return NotFound();
        Require(!await db.Doctors.AnyAsync(x => x.DepartmentID == id), "Department contains doctors.", 409);
        db.Departments.Remove(d); await workflow.Save("Department", "Delete", id); return NoContent();
    }
}
