using HSMDataAccess.DTOs.Appointments;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class AppointmentResponseMapper
    {
        public async Task< AppointmentResponseDTO> ToResponseDTO(Appointment appointment)
        {
            return new AppointmentResponseDTO(appointment.ID, appointment.PatientID, appointment.DoctorID
                , appointment.Date.ToString(), appointment.Time.ToString(),appointment.Duration, appointment.Status
                , appointment.NotificationSent, "", "", "");
        }
    }
}
