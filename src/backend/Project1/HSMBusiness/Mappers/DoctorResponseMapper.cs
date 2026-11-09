using HSMDataAccess.DTOs.Doctors;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class DoctorResponseMapper
    {
        public DoctorResponse ToResponse(Doctor doctor, User user, Person person)
        {

            return new DoctorResponse
            {
                doctorId = doctor.ID,
                name = user.Name,
                departmentId = doctor.DepartmentID,
                specialty = doctor.Specialization,
                contactNumber = person.ContactNumber,
                email = person.Email,
                status = doctor.Status == true ? "Active" : "InActive",
                createdOn = "",
                updatedOn = ""
            };
        }
    }
}
