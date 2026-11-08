using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.DTOs.Doctors
{
    public class DoctorDTO
    {
        /*export interface Doctor {
  doctorId: string;
  name: string;
  departmentId: string;
  specialty: string;
  contactNumber?: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
  updatedOn: string;
}
*/
        /* Doctorrequest
         
        {
        firstname,
        lastname,
        dateofbirth
        }


         
        Doctorresponse
        {
        fullname,
        age
        }
        Doctorresponse
          {
    "id": "3DE8F76A-B",
    "departmentID": "12        ",
    "specialization": "ENT",
    "status": true,
    "user":{
        name,
        ......
        }
        }
        
         
         
         */


        public string ID { get; set; } = null!;
        // Foreign Keys
        public string DepartmentID { get; set; } = null!;
        // Properties
        public string Specialization { get; set; } = null!;
        public bool Status { get; set; }
        public string UserID { get; set; }
        public DoctorDTO(string id,string departmentID,string specialization,
        bool status,string UserID)
        {
            ID = id;
            DepartmentID = departmentID;
            Specialization = specialization;
            Status = status;
            this.UserID = UserID;
        }
    }
}
