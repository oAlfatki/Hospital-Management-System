using HSMAPI.Contracts;
using HSMAPI.Services;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static HSMAPI.Services.WorkflowService;

namespace HSMAPI.Controllers;

[ApiController, Authorize(Roles = "Doctor,Nurse"), Route("api/records")]
public class MedicalRecordController(AppDBContext db, WorkflowService workflow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> All() => Ok((await db.MedicalRecords.AsNoTracking().ToListAsync()).Select(RecordView));
    [HttpPost]
    public async Task<IActionResult> Create(RecordRequest r)
    {
        Require(await db.Patients.AnyAsync(x => x.ID == r.PatientId && x.Status), "Active patient not found.", 404);
        var record = new MedicalRecord { ID = Id(), PatientID = r.PatientId, Diagnosis = r.Diagnosis.Trim(), Treatment = r.Treatment.Trim(),
            Prescriptions = r.Prescriptions, Status = r.Status, AccessLevel = "Clinical", AuditTrail = "[]", CreatedBy = workflow.Actor, UpdatedBy = workflow.Actor };
        AppendHistory(record); db.MedicalRecords.Add(record); await workflow.Save("MedicalRecord", "Create", record.ID);
        return StatusCode(201, RecordView(record));
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, RecordUpdateRequest r)
    {
        var record = await db.MedicalRecords.FindAsync(id); if (record is null) return NotFound();
        Require(record.Version == r.Version, "Record was changed by another user. Refresh before saving.", 409);
        record.Diagnosis = r.Diagnosis.Trim(); record.Treatment = r.Treatment.Trim(); record.Prescriptions = r.Prescriptions;
        record.Status = r.Status; record.UpdatedBy = workflow.Actor; record.UpdatedOn = DateTime.UtcNow; record.Version++;
        AppendHistory(record); await workflow.Save("MedicalRecord", "Update", id); return Ok(RecordView(record));
    }
}
