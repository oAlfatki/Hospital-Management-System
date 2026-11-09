using HSMDataAccess.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HSMAPI.Controllers;

[ApiController, Authorize, Route("api/dashboard")]
public class DashboardController(AppDBContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var month = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var finance = User.IsInRole("Admin") || User.IsInRole("Accounts") || User.IsInRole("Management");
        var appointments = await db.Appointments.Include(x => x.patient).ThenInclude(x => x.Person)
            .Include(x => x.doctor).ThenInclude(x => x.Person).AsNoTracking().Where(x => x.Status != "Cancelled").ToListAsync();
        var doctors = await db.Doctors.Include(x => x.Person).AsNoTracking().ToListAsync();
        var payments = finance ? await db.Set<HSMDataAccess.Entities.Payment>().AsNoTracking().Where(x => x.PaidOn >= month).ToListAsync() : [];
        var bills = finance ? await db.Bills.AsNoTracking().Where(x => x.Status != "Cancelled").ToListAsync() : [];
        var revenue = payments.GroupBy(x => x.PaidOn.ToString("yyyy-MM-dd")).ToDictionary(x => x.Key, x => x.Sum(p => p.Amount));
        return Ok(new
        {
            financeVisible = finance,
            stats = new { totalPatients = await db.Patients.CountAsync(x => x.Status),
                appointmentsToday = appointments.Count(x => x.Date == today),
                monthlyRevenue = finance ? payments.Sum(x => x.Amount) : (decimal?)null,
                pendingDues = finance ? bills.Sum(x => x.PatientResponsibility - (x.PartialPaymentAmount ?? 0)) : (decimal?)null },
            upcomingAppts = appointments.Where(x => x.Date.ToDateTime(x.Time ?? TimeOnly.MinValue) > DateTime.Now)
                .OrderBy(x => x.Date).ThenBy(x => x.Time).Take(5).Select(x => new { appointmentId = x.ID.Trim(),
                    appointmentDate = x.Date, appointmentTime = x.Time?.ToString("HH:mm"), status = x.Status.Trim(),
                    patientName = x.patient.Person.Name, doctorName = x.doctor.Person?.Name ?? "", specialty = x.doctor.Specialization }),
            revenueData = finance ? Enumerable.Range(0, DateTime.UtcNow.Day).Select(offset => month.AddDays(offset))
                .Select(day => new { date = day.ToString("yyyy-MM-dd"), revenue = revenue.GetValueOrDefault(day.ToString("yyyy-MM-dd")) }).ToArray() : [],
            doctorApptData = doctors.Select(d => new { name = d.Person?.Name ?? "", appointments = appointments.Count(x => x.DoctorID == d.ID) })
        });
    }
}
