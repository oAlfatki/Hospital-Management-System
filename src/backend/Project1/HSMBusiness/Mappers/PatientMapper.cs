using HSMBusiness.dto;
using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class PatientMapper
    {
        public enum enMode { Add, Update }
        public  PatientDTO ToDTO(Patient patient)
        {
            return new PatientDTO(patient.ID, patient.MedicalHistory, patient.Status, patient.PersonID);
        }
        public Patient ToEntity(PatientDTO patientDTO,enMode mode =enMode.Add,Patient patient=null)
        {
            if (mode == enMode.Add)
            {
                return new Patient
                {
                    MedicalHistory = patientDTO.MedicalHistory,
                    Status = patientDTO.Status,
                    PersonID = patientDTO.PersonID
                };
            }
            else
            {
                patient.MedicalHistory = patientDTO.MedicalHistory;
                patient.Status = patientDTO.Status;
                patient.PersonID = patientDTO.PersonID;
            }
            return patient;
        }


        public static PatientResponse ToResponse(Patient p) => new(p.ID.Trim(), p.Person.Name.Trim(), p.Person.DateOfBirth,
            p.Person.Gender.Trim(), p.Person.ContactNumber?.Trim() ?? "", p.Person.Email, p.Person.Address, p.MedicalHistory,
            p.ClinicalStatus == "Deceased" ? "Deceased" : p.Status ? "Active" : "Inactive", p.CreatedBy, p.CreatedOn, p.UpdatedOn);
        public static void ApplyProfile(Patient p, PatientRequest r)
        {
            PersonMapper.ApplyProfile(p.Person, r.Name, r.Email, r.ContactNumber);
            p.Person.DateOfBirth = r.DateOfBirth; p.Person.Gender = r.Gender; p.Person.Address = r.Address;
            p.MedicalHistory = r.MedicalHistory; p.Status = r.Status == "Active"; p.ClinicalStatus = r.Status; p.UpdatedOn = DateTime.UtcNow;
        }

    }
}
