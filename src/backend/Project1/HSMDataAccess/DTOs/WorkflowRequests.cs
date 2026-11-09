using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HSMDataAccess.DTOs;

public class PatientRequest
{
    [Required, StringLength(200, MinimumLength = 3)] public string Name { get; set; } = "";
    public DateOnly DateOfBirth { get; set; }
    [Required, RegularExpression("Male|Female|Other|Prefer not to say")] public string Gender { get; set; } = "";
    [Required, RegularExpression(@"\d{10}")] public string ContactNumber { get; set; } = "";
    [Required, EmailAddress, StringLength(250)] public string Email { get; set; } = "";
    [StringLength(255)] public string Address { get; set; } = "";
    [StringLength(1000)] public string MedicalHistory { get; set; } = "";
    [Required, RegularExpression("Active|Inactive|Deceased")] public string Status { get; set; } = "Active";
}

public class StaffRequest
{
    [Required, StringLength(200, MinimumLength = 2)] public string Name { get; set; } = "";
    [Required, EmailAddress, StringLength(250)] public string Email { get; set; } = "";
    [Required, RegularExpression("Admin|Doctor|Nurse|Accounts|Management")] public string Role { get; set; } = "Nurse";
    [RegularExpression(@"\d{10}")] public string? ContactNumber { get; set; }
    [StringLength(200)] public string? Department { get; set; }
    [Required, RegularExpression("Active|Inactive")] public string Status { get; set; } = "Active";
    [StringLength(128, MinimumLength = 12)] public string? Password { get; set; }
}

public class DoctorRequest
{
    [Required, StringLength(200, MinimumLength = 3)] public string Name { get; set; } = "";
    [Required] public string DepartmentId { get; set; } = "";
    [Required, StringLength(50)] public string Specialty { get; set; } = "";
    [Required, RegularExpression(@"\d{10}")] public string ContactNumber { get; set; } = "";
    [Required, EmailAddress, StringLength(250)] public string Email { get; set; } = "";
    [Required, RegularExpression("Active|Inactive")] public string Status { get; set; } = "Active";
}

public class DepartmentRequest
{
    [Required, StringLength(100, MinimumLength = 2)] public string Name { get; set; } = "";
    public string? HeadOfDepartment { get; set; }
    [StringLength(500)] public string? Description { get; set; }
}

public class AppointmentRequest
{
    [Required] public string PatientId { get; set; } = "";
    [Required] public string DoctorId { get; set; } = "";
    [JsonRequired] public DateOnly AppointmentDate { get; set; }
    [JsonRequired] public TimeOnly AppointmentTime { get; set; }
    [Range(1, 480)] public int DurationMinutes { get; set; }
}
public record AppointmentStatusRequest([Required, RegularExpression("Scheduled|Rescheduled|Cancelled")] string Status);
public class RescheduleRequest
{
    [JsonRequired] public DateOnly NewDate { get; set; }
    [JsonRequired] public TimeOnly NewTime { get; set; }
}
public record ServiceItemRequest([Required, StringLength(255)] string ServiceName, [Range(typeof(decimal), "0.01", "99999999")] decimal Cost);
public class BillRequest
{
    [Required] public string PatientId { get; set; } = "";
    [Required, MinLength(1), MaxLength(100)] public List<ServiceItemRequest> Services { get; set; } = [];
    [Range(0, 100)] public decimal TaxPercent { get; set; }
    [Range(typeof(decimal), "0", "99999999")] public decimal DiscountAmount { get; set; }
    public DateOnly DueDate { get; set; }
}
public record PaymentRequest([Range(typeof(decimal), "0.01", "99999999")] decimal AmountToPay);
public class RecordRequest
{
    [Required] public string PatientId { get; set; } = "";
    [Required, StringLength(10000)] public string Diagnosis { get; set; } = "";
    [Required, StringLength(10000)] public string Treatment { get; set; } = "";
    [StringLength(10000)] public string Prescriptions { get; set; } = "";
    [Required, RegularExpression("Active|Archived")] public string Status { get; set; } = "Active";
}
public class RecordUpdateRequest
{
    [Required, StringLength(10000)] public string Diagnosis { get; set; } = "";
    [Required, StringLength(10000)] public string Treatment { get; set; } = "";
    [StringLength(10000)] public string Prescriptions { get; set; } = "";
    [Required, RegularExpression("Active|Archived")] public string Status { get; set; } = "Active";
    [Range(1, int.MaxValue)] public int Version { get; set; }
}
public record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
