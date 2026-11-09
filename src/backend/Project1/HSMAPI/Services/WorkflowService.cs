using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace HSMAPI.Services;

public class WorkflowException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

// Changes and their audit entries share one SaveChanges transaction.
public class WorkflowService(AppDBContext db, IHttpContextAccessor accessor)
{
    public string Actor => accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
    public static string Id() => Guid.NewGuid().ToString("N")[..10];
    public static decimal Money(decimal amount) => decimal.Round(amount, 2, MidpointRounding.AwayFromZero);
    public static void Require(bool condition, string message, int status = 400)
    {
        if (!condition) throw new WorkflowException(status, message);
    }
    public async Task Save(string entity, string action, string id)
    {
        if (Actor.Length > 0)
            db.AuditLogs.Add(new AuditLog { ID = Id(), UserID = Actor, Entity = entity,
                Action = action, Timestamp = DateTime.UtcNow, Details = $"{action} {entity} {id}" });
        await db.SaveChangesAsync();
    }
    public async Task CheckPerson(string email, string? phone, string? exceptId = null)
    {
        Require(!await db.People.AnyAsync(p => p.ID != exceptId && p.Email == email.Trim().ToLowerInvariant()), "Email is already registered.", 409);
        if (!string.IsNullOrWhiteSpace(phone))
            Require(!await db.People.AnyAsync(p => p.ID != exceptId && p.ContactNumber == phone), "Contact number is already registered.", 409);
    }
    public static Person NewPerson(string name, string email, string? phone) => new()
    {
        ID = Id(), Name = name.Trim(), Email = email.Trim().ToLowerInvariant(),
        ContactNumber = string.IsNullOrWhiteSpace(phone) ? null! : phone, Gender = "Other", Address = "", DateOfBirth = new DateOnly(2000, 1, 1)
    };
    public static object PatientView(Patient p) => new
    {
        patientId = p.ID.Trim(), name = p.Person.Name.Trim(), p.Person.DateOfBirth,
        gender = p.Person.Gender.Trim(), contactNumber = p.Person.ContactNumber?.Trim() ?? "", p.Person.Email, p.Person.Address, p.MedicalHistory,
        status = p.ClinicalStatus == "Deceased" ? "Deceased" : p.Status ? "Active" : "Inactive", p.CreatedBy, p.CreatedOn, p.UpdatedOn
    };
    public static object UserView(User u) => new
    {
        userId = u.ID.Trim(), name = u.Person.Name.Trim(), u.Person.Email, contactNumber = u.Person.ContactNumber?.Trim() ?? "",
        role = u.Role.Trim(), status = u.Status ? "Active" : "Inactive", department = u.DepartmentName, u.CreatedOn, u.UpdatedOn
    };
    public static object DoctorView(Doctor d) => new
    {
        doctorId = d.ID.Trim(), name = (d.Person ?? d.User?.Person)?.Name.Trim() ?? "",
        email = (d.Person ?? d.User?.Person)?.Email ?? "", contactNumber = (d.Person ?? d.User?.Person)?.ContactNumber?.Trim() ?? "",
        departmentId = d.DepartmentID.Trim(), specialty = d.Specialization, status = d.Status ? "Active" : "Inactive", d.CreatedOn, d.UpdatedOn
    };
    public static object DepartmentView(Department d) => new
    {
        departmentId = d.ID.Trim(), d.Name, headOfDepartment = d.HeadOf?.Trim(), d.Description, d.CreatedOn, d.UpdatedOn
    };
    public static object AppointmentView(Appointment a) => new
    {
        appointmentId = a.ID.Trim(), patientId = a.PatientID.Trim(), doctorId = a.DoctorID.Trim(), appointmentDate = a.Date,
        appointmentTime = a.Time?.ToString("HH:mm"), durationMinutes = a.Duration, status = a.Status.Trim(),
        notificationSent = a.NotificationSent ?? false, a.CreatedBy, a.CreatedOn, a.UpdatedOn
    };
    public static object BillView(Bill b)
    {
        var due = Money(b.PatientResponsibility - (b.PartialPaymentAmount ?? 0));
        return new
        {
            billId = b.ID.Trim(), patientId = b.PatientID.Trim(), services = b.Lines.Select(l => new { l.ServiceName, l.Cost }),
            subtotal = b.GrossAmount, b.TaxPercent, discountAmount = b.Discount ?? 0, totalAmount = b.PatientResponsibility,
            paidAmount = b.PartialPaymentAmount ?? 0, pendingDue = due,
            status = b.Status == "Cancelled" ? "Cancelled" : b.Status == "Pending Insurance" ? "Pending Insurance" : due <= 0 ? "Paid" : b.DueDate?.Date < DateTime.UtcNow.Date ? "Overdue" : "Pending",
            dueDate = b.DueDate?.ToString("yyyy-MM-dd"), invoiceGenerated = true,
            paymentDate = b.Payments.OrderByDescending(p => p.PaidOn).FirstOrDefault()?.PaidOn, b.CreatedBy, b.CreatedOn, b.UpdatedOn
        };
    }
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    public record RecordVersion(int Version, string Diagnosis, string Treatment, string Prescriptions, string UpdatedBy, DateTime? UpdatedOn);
    public static List<RecordVersion> History(MedicalRecord r)
    {
        try { return JsonSerializer.Deserialize<List<RecordVersion>>(r.AuditTrail, JsonOptions) ?? []; }
        catch (JsonException) { return []; }
    }
    public static void AppendHistory(MedicalRecord r)
    {
        var versions = History(r);
        versions.Add(new(r.Version, r.Diagnosis ?? "", r.Treatment ?? "", r.Prescriptions ?? "", r.UpdatedBy, r.UpdatedOn));
        r.AuditTrail = JsonSerializer.Serialize(versions, JsonOptions);
    }
    public static object RecordView(MedicalRecord r) => new
    {
        recordId = r.ID.Trim(), patientId = r.PatientID.Trim(), diagnosis = r.Diagnosis ?? "", treatment = r.Treatment ?? "",
        prescriptions = r.Prescriptions ?? "", status = r.Status?.Trim() ?? "Active", r.CreatedBy, r.CreatedOn, r.UpdatedBy,
        r.UpdatedOn, r.Version, history = History(r)
    };
    public static object NotificationView(Notification n) => new
    {
        notificationId = n.ID.Trim(), patientId = n.PatientID.Trim(), userId = n.UserID.Trim(), n.Type, n.Message,
        status = n.Status.Trim(), sentOn = n.SentOn, deliveryConfirmation = n.DeliveryConfirmation ?? false, retries = 0
    };
}
