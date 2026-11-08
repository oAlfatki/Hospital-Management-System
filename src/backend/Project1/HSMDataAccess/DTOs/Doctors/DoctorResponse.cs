using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.DTOs.Doctors
{
    public class DoctorResponse
    {
        public string doctorId { get; set; } = null!;
        public string name { get; set; } = null!;
        public string departmentId { get; set; } = null!;
        public string specialty { get; set; } = null!;
        public string? contactNumber{ get; set; }
        public string email { get; set; } = null!;
        public string status { get; set; } = null!;
        public string? createdOn { get; set; }
        public string? updatedOn { get; set; }
        public DoctorResponse()
        {

        }
        public DoctorResponse(string doctorId,string name,string departmentId,string specialty, string? contactNumber,string email,string status,string? createdOn,string? updatedOn)
        {
            this.doctorId = doctorId;
            this.name = name;
            this.departmentId = departmentId;
            this.specialty = specialty;
            this.contactNumber = contactNumber;
            this.email = email;
            this.status = status;
            this.createdOn = createdOn;
            this.updatedOn = updatedOn;
        }
    }
}
