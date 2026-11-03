import { recordApi } from '../api/recordApi';
import { RecordMapper } from '../mappers/recordMapper';
import type { MedicalRecord } from '../types/records.types';
import type { CreateRecordRequest } from '../types/CreateRecordRequest';
import type { UpdateRecordRequest } from '../types/UpdateRecordRequest';

export const recordService = {
  async getAll(): Promise<MedicalRecord[]> {
    const responses = await recordApi.getAll();
    return RecordMapper.toDomainList(responses);
  },

  async getPatientRecord(patientId: string): Promise<MedicalRecord | null> {
    const records = await this.getAll();
    return records.find((r) => r.patientId === patientId) || null;
  },

  async create(request: CreateRecordRequest): Promise<MedicalRecord> {
    const response = await recordApi.create(request);
    return RecordMapper.toDomain(response);
  },

  async update(request: UpdateRecordRequest): Promise<MedicalRecord> {
    const response = await recordApi.update(request);
    return RecordMapper.toDomain(response);
  },
};
