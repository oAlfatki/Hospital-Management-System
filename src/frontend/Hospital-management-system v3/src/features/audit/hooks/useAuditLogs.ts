import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import type { AuditLog } from '../types/audit.types';
import { useAuth } from '@/src/core/providers';

export const useAuditLogs = () => {
  const { user } = useAuth();
  const isAuthorized = !!user && (user.role === 'Admin' || user.role === 'Management');
  return useQuery<AuditLog[]>({
    queryKey: ['audit_logs'],
    queryFn: () => auditService.getAll(),
    enabled: isAuthorized,
  });
};
