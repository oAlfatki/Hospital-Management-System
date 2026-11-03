import { auditApi } from '../api/auditApi';
import { AuditMapper } from '../mappers/auditMapper';
import type { AuditLog } from '../types/audit.types';

export const auditService = {
  async getAll(): Promise<AuditLog[]> {
    const responses = await auditApi.getAll();
    return AuditMapper.toDomainList(responses);
  },
};
