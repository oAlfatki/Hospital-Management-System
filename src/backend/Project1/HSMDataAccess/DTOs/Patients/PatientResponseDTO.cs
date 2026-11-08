using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.DTOs.Patients
{
    public class PatientResponseDTO
    {
        public string PatientId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string DateOfBirth { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public string ContactNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string MedicalHistory { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? CreatedBy { get; set; }
        public string? CreatedOn { get; set; }
        public string? UpdatedOn { get; set; }
        public PatientResponseDTO(string patientId,string name,string dateOfBirth, string gender,string contactNumber,string email,string medicalHistory, string address,string status,string createdBy,string createdOn,string updatedOn)
        {
            PatientId = patientId;
            Name = name;
            DateOfBirth = dateOfBirth;
            Gender = gender;
            ContactNumber = contactNumber;
            Email = email;
            MedicalHistory = medicalHistory;
            Address = address;
            Status = status;
            CreatedBy = createdBy;
            CreatedOn = createdOn;
            UpdatedOn = updatedOn;
        }
    }
}
