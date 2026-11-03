import { useState, useMemo } from 'react';
import { AuditLog } from '../../users/types/users.types';

export const useAuditFilters = (logs: AuditLog[]) => {
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesEntity = entityFilter === 'All' ? true : log.entity === entityFilter;
      const matchesAction = actionFilter === 'All' ? true : log.action === actionFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        log.details?.toLowerCase().includes(term) ||
        log.userId.toLowerCase().includes(term) ||
        log.userName?.toLowerCase().includes(term) ||
        log.auditId.toLowerCase().includes(term);

      return matchesEntity && matchesAction && matchesSearch;
    });
  }, [logs, entityFilter, actionFilter, searchTerm]);

  return {
    entityFilter,
    setEntityFilter,
    actionFilter,
    setActionFilter,
    searchTerm,
    setSearchTerm,
    filteredLogs,
  };
};
