using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.DTOs.Appointments
{
    public class AppointmentResponseDTO
    {
        public string AppointmentId { get; set; } = null!;
        public string PatientId { get; set; } = null!;
        public string DoctorId { get; set; } = null!;
        public string AppointmentDate { get; set; } = null!;
        public string AppointmentTime { get; set; } = null!;
        public int DurationMinutes { get; set; }
        public string Status { get; set; } = null!;
        public bool? NotificationSent { get; set; }
        public string? CreatedBy { get; set; }
        public string? CreatedOn { get; set; }
        public string? UpdatedOn { get; set; }
        public AppointmentResponseDTO(string appointmentId,string patientId,string doctorId,string appointmentDate,string? appointmentTime,int durationMinutes,string status,bool? notificationSent,string createdBy,string createdOn,string updatedOn)
        {
            AppointmentId = appointmentId;
            PatientId = patientId;
            DoctorId = doctorId;
            AppointmentDate = appointmentDate;
            AppointmentTime = appointmentTime;
            DurationMinutes = durationMinutes;
            Status = status;
            NotificationSent = notificationSent;
            CreatedBy = createdBy;
            CreatedOn = createdOn;
            UpdatedOn = updatedOn;
        }
    }
}
