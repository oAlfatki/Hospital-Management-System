using HSMBusiness.Mappers;
using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.dto
{
    public class DoctorMapper
    {
        public enum enMode { Add,Update}

        public DoctorDTO ToDTO(Doctor doctor)
        {
            return new DoctorDTO(doctor.ID,
                 doctor.DepartmentID,
                    doctor.Specialization,
                    doctor.Status,
                    doctor.UserID
                );
        }
        public Doctor ToEntity(DoctorDTO doctorDTO,enMode mode=enMode.Add,Doctor doctor=null)
        {
            if (mode == enMode.Add){
                doctor= new Doctor
                {

                    DepartmentID = doctorDTO.DepartmentID,
                    Specialization = doctorDTO.Specialization,
                    Status = doctorDTO.Status,
                    UserID = doctorDTO.UserID
                };
                return doctor;
            }
            else
            {
                doctor.DepartmentID = doctorDTO.DepartmentID;
                doctor.Specialization = doctorDTO.Specialization;
                doctor.Status = doctorDTO.Status;
                doctor.UserID = doctorDTO.UserID;
                return doctor;
            }

        }


        public static DoctorResponse ToResponse(Doctor d)
        {
            var person = d.Person ?? d.User?.Person;
            return new(d.ID.Trim(), person?.Name.Trim() ?? "", person?.Email ?? "", person?.ContactNumber?.Trim() ?? "",
                d.DepartmentID.Trim(), d.Specialization, d.Status ? "Active" : "Inactive", d.CreatedOn, d.UpdatedOn);
        }
        public static void ApplyProfile(Doctor d, DoctorRequest r)
        {
            PersonMapper.ApplyProfile(d.Person, r.Name, r.Email, r.ContactNumber);
            d.DepartmentID = r.DepartmentId; d.Specialization = r.Specialty.Trim(); d.Status = r.Status == "Active"; d.UpdatedOn = DateTime.UtcNow;
        }

    }
}
