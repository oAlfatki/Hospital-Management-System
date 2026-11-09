import { auditApi } from '../api/auditApi';
import { AuditMapper } from '../mappers/auditMapper';
import type { AuditLog } from '../types/audit.types';

export const auditService = {
  exportToCSV(logs: AuditLog[], headers: string[]): string {
    const rows = logs.map(log => [log.auditId, log.userId, log.userName || 'Unknown', log.entity, log.action, log.timestamp, log.details || '']);
    const cell = (value: string) => {
      const text = /^[=+@\t\r-]/.test(value) ? "'" + value : value;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
  },
  async getAll(): Promise<AuditLog[]> {
    const responses = await auditApi.getAll();
    return AuditMapper.toDomainList(responses);
  },
};
