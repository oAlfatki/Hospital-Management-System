import type { MedicalRecord } from '../types/records.types';
import type { RecordResponse } from '../types/RecordResponse';
import type { CreateRecordRequest } from '../types/CreateRecordRequest';
import type { UpdateRecordRequest } from '../types/UpdateRecordRequest';
import type { IRecordFormInput, IUpdateRecordFormInput } from '../types/IRecordFormInput';

export const RecordMapper = {
  toDomain(res: RecordResponse | MedicalRecord): MedicalRecord {
    return {
      recordId: res.recordId,
      patientId: res.patientId,
      diagnosis: res.diagnosis,
      treatment: res.treatment,
      prescriptions: res.prescriptions,
      status: res.status,
      createdBy: res.createdBy,
      createdOn: res.createdOn || '',
      updatedBy: res.updatedBy,
      updatedOn: res.updatedOn || '',
      version: res.version,
      history: res.history || [],
    };
  },

  toDomainList(records: (RecordResponse | MedicalRecord)[]): MedicalRecord[] {
    return records.map((r) => this.toDomain(r));
  },

  toCreateRequest(form: IRecordFormInput): CreateRecordRequest {
    return {
      patientId: form.patientId,
      diagnosis: form.diagnosis.trim(),
      treatment: form.treatment.trim(),
      prescriptions: form.prescriptions.trim(),
      status: form.status,
    };
  },

  toUpdateRequest(recordId: string, version: number, form: IUpdateRecordFormInput): UpdateRecordRequest {
    return {
      recordId,
      version,
      diagnosis: form.diagnosis.trim(),
      treatment: form.treatment.trim(),
      prescriptions: form.prescriptions.trim(),
      status: form.status,
    };
  },

  toFormValues(record: MedicalRecord): IRecordFormInput {
    return {
      patientId: record.patientId,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescriptions: record.prescriptions,
      status: record.status,
    };
  },
};
