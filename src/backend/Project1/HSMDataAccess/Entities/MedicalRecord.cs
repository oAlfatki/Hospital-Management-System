using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMDataAccess.Entities
{
    public class MedicalRecord
    {
        public DateTime? CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedOn { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "";
        public int Version { get; set; } = 1;
        public string UpdatedBy { get; set; } = "";

        public string ID { get; set; } = null!;
        public string PatientID { get; set; } = null!;
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public string? Prescriptions { get; set; }
        public string? Status { get; set; }
        public string AuditTrail { get; set; } = null!;
        public string AccessLevel { get; set; } = null!;
        public virtual Patient patient { get; set; } = null!;
    }
}
