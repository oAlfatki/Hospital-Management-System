using HSMBusiness.Services;
using HSMDataAccess.DTOs.Patients;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class PatientResponseMapper
    {
        public  async Task<PatientResponseDTO> ToResponse(Patient patient, PersonService personService)
        {
            var person =await personService.Find(patient.PersonID);
            if (person == null)
            {
                throw new ArgumentNullException(nameof(person));
            }
            
            return new PatientResponseDTO(patient.ID, person.Name, (person.DateOfBirth).ToString(), person.Gender, person.ContactNumber, person.Email, patient.MedicalHistory, person.Address, (patient.Status == true ? "Active" : "InActive"), "", "", "");
        }
    }
}
