using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.DTOs
{
    public class PatientDTO
    {
        public string ID { get; set; } = null!;
        public string MedicalHistory { get; set; } = null!;
        public bool Status { get; set; } = false;
        //public string PersonID { get; set; } = null!;
        public string? Name { get; set; }
        public string? ContactNumber { get; set; }
        public string? Gender { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public PatientDTO(string ID, string MedicalHistory, bool Status, string? Name, string? ContactNumber, string? Gender, string? Email, string? Address, DateTime? DateOfBirth)
        {
            this.ID = ID;
            this.MedicalHistory = MedicalHistory;
            this.Status = Status;
            //this.PersonID = PersonID;
            this.Name = Name;
            this.ContactNumber = ContactNumber;
            this.Gender = Gender;
            this.Email = Email;
            this.Address = Address;
            this.DateOfBirth = DateOfBirth;
        }
    }
}