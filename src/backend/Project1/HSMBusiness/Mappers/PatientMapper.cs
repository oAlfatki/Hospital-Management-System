using HSMBusiness.Services;
using HSMDataAccess.DTOs;
using HSMDataAccess.DTOs.Patients;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class PatientMapper
    {
        public enum enMode { Add, Update }
        public PatientDTO ToDTO(Patient patient)
        {
            return new PatientDTO(patient.ID, patient.MedicalHistory, patient.Status, patient.Name, patient.ContactNumber, patient.Gender, patient.Email, patient.Address, patient.DateOfBirth);
        }
        public Patient ToEntity(PatientDTO patientDTO,enMode mode =enMode.Add,Patient patient=null)
        {
            if (mode == enMode.Add)
            {
                return new Patient
                {
                    MedicalHistory = patientDTO.MedicalHistory,
                    Status = patientDTO.Status,
                    //PersonID = patientDTO.PersonID
                    Name = patientDTO.Name,
                    ContactNumber=patientDTO.ContactNumber,
                    Gender=patientDTO.Gender,
                    Email=patientDTO.Email,
                    Address=patientDTO.Address,
                    DateOfBirth=patientDTO.DateOfBirth
                };

            }
            else
            {
                patient.MedicalHistory = patientDTO.MedicalHistory;
                patient.Status = patientDTO.Status;
                //patient.PersonID = patientDTO.PersonID;
                patient.Name = patientDTO.Name;
                patient.ContactNumber = patientDTO.ContactNumber;
                patient.Gender = patientDTO.Gender;
                patient.Email = patientDTO.Email;
                patient.Address = patientDTO.Address;
                patient.DateOfBirth = patientDTO.DateOfBirth;
            }
            return patient;
        }
       
    }
}
