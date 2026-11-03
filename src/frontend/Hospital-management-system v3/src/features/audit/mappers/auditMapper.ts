import type { AuditLog, AuditAction, AuditEntity } from '../types/audit.types';
import type { AuditLogResponse } from '../types/AuditLogResponse';

export const AuditMapper = {
  toDomain(res: AuditLogResponse | AuditLog): AuditLog {
    if ('entity' in res) {
      return { ...res };
    }
    return {
      auditId: res.auditId,
      userId: res.userId,
      userName: res.userId,
      entity: (res.resource || 'User') as AuditEntity,
      action: (res.action || 'Access') as AuditAction,
      timestamp: res.timestamp,
      details: res.details,
    };
  },

  toDomainList(logs: (AuditLogResponse | AuditLog)[]): AuditLog[] {
    return logs.map((l) => this.toDomain(l));
  },
};
