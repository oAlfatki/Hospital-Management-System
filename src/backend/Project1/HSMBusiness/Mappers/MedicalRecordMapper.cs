using HSMDataAccess.DTOs;
using HSMDataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HSMBusiness.Mappers
{
    public class MedicalRecordMapper
    {
        public enum enMode { Add, Update }
        public MedicalRecord ToEntity(MedicalRecordDTO medicalRecordDTO,enMode mode = enMode.Add)
        {
            if (mode == enMode.Add)
            {
                return new MedicalRecord
                {
                    PatientID = medicalRecordDTO.PatientID,
                    Diagnosis = medicalRecordDTO.Diagnosis,
                    Treatment = medicalRecordDTO.Treatment,
                    Prescriptions = medicalRecordDTO.Prescriptions,
                    Status = medicalRecordDTO.Status,
                    AuditTrail = medicalRecordDTO.AuditTrail,
                    AccessLevel = medicalRecordDTO.AccessLevel
                };
            }
            else
            {
                return new MedicalRecord
                {
                    PatientID = medicalRecordDTO.PatientID,
                    Diagnosis = medicalRecordDTO.Diagnosis,
                    Treatment = medicalRecordDTO.Treatment,
                    Prescriptions = medicalRecordDTO.Prescriptions,
                    Status = medicalRecordDTO.Status,
                    AuditTrail = medicalRecordDTO.AuditTrail,
                    AccessLevel = medicalRecordDTO.AccessLevel
                };
            }
        }

        public MedicalRecordDTO ToDTO(MedicalRecord medicalRecord)
        {
            return new MedicalRecordDTO
            (
                medicalRecord.ID,
                medicalRecord.PatientID,
                medicalRecord.Diagnosis,
                medicalRecord.Treatment,
                medicalRecord.Prescriptions,
                medicalRecord.Status,
                medicalRecord.AuditTrail,
                medicalRecord.AccessLevel
            );
        }

        private static readonly System.Text.Json.JsonSerializerOptions VersionJson = new(System.Text.Json.JsonSerializerDefaults.Web);
        public static List<RecordVersionResponse> ReadHistory(MedicalRecord r)
        {
            try { return System.Text.Json.JsonSerializer.Deserialize<List<RecordVersionResponse>>(r.AuditTrail, VersionJson) ?? []; }
            catch (System.Text.Json.JsonException) { return []; }
        }
        public static MedicalRecordResponse ToResponse(MedicalRecord r) => new(r.ID.Trim(), r.PatientID.Trim(), r.Diagnosis ?? "",
            r.Treatment ?? "", r.Prescriptions ?? "", r.Status?.Trim() ?? "Active", r.CreatedBy, r.CreatedOn, r.UpdatedBy,
            r.UpdatedOn, r.Version, ReadHistory(r));
        public static void StoreHistory(MedicalRecord r, IReadOnlyList<RecordVersionResponse> history) =>
            r.AuditTrail = System.Text.Json.JsonSerializer.Serialize(history, VersionJson);

    }
}
