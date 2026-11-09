namespace HSMDataAccess.DTOs;

public record PatientResponse(string PatientId, string Name, DateOnly DateOfBirth, string Gender,
    string ContactNumber, string Email, string Address, string MedicalHistory, string Status,
    string CreatedBy, DateTime? CreatedOn, DateTime? UpdatedOn);
public record UserResponse(string UserId, string Name, string Email, string ContactNumber, string Role,
    string Status, string? Department, DateTime? CreatedOn, DateTime? UpdatedOn);
public record DoctorResponse(string DoctorId, string Name, string Email, string ContactNumber,
    string DepartmentId, string Specialty, string Status, DateTime? CreatedOn, DateTime? UpdatedOn);
public record DepartmentResponse(string DepartmentId, string Name, string? HeadOfDepartment,
    string? Description, DateTime? CreatedOn, DateTime? UpdatedOn);
public record AppointmentResponse(string AppointmentId, string PatientId, string DoctorId,
    DateOnly AppointmentDate, string? AppointmentTime, int DurationMinutes, string Status,
    bool NotificationSent, string CreatedBy, DateTime? CreatedOn, DateTime? UpdatedOn);
public record ServiceItemResponse(string ServiceName, decimal Cost);
public record BillResponse(string BillId, string PatientId, IReadOnlyList<ServiceItemResponse> Services,
    decimal Subtotal, decimal TaxPercent, decimal DiscountAmount, decimal TotalAmount, decimal PaidAmount,
    decimal PendingDue, string Status, string? DueDate, bool InvoiceGenerated, DateTime? PaymentDate,
    string CreatedBy, DateTime? CreatedOn, DateTime? UpdatedOn);
public record RecordVersionResponse(int Version, string Diagnosis, string Treatment, string Prescriptions,
    string UpdatedBy, DateTime? UpdatedOn);
public record MedicalRecordResponse(string RecordId, string PatientId, string Diagnosis, string Treatment,
    string Prescriptions, string Status, string CreatedBy, DateTime? CreatedOn, string UpdatedBy,
    DateTime? UpdatedOn, int Version, IReadOnlyList<RecordVersionResponse> History);
public record NotificationResponse(string NotificationId, string PatientId, string UserId, string Type,
    string Message, string Status, DateTime? SentOn, bool DeliveryConfirmation, int Retries);
public record AuditLogResponse(string AuditId, string UserId, string UserName, string Entity,
    string Action, DateTime Timestamp, string? Details);
public record DashboardStats(int TotalPatients, int AppointmentsToday, decimal? MonthlyRevenue, decimal? PendingDues);
public record UpcomingAppointmentResponse(string AppointmentId, DateOnly AppointmentDate, string? AppointmentTime,
    string Status, string PatientName, string DoctorName, string Specialty);
public record DailyRevenueResponse(string Date, decimal Revenue);
public record DoctorWorkloadResponse(string Name, int Appointments);
public record DashboardResponse(bool FinanceVisible, DashboardStats Stats,
    IReadOnlyList<UpcomingAppointmentResponse> UpcomingAppts, IReadOnlyList<DailyRevenueResponse> RevenueData,
    IReadOnlyList<DoctorWorkloadResponse> DoctorApptData);
