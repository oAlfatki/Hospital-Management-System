import { useState, useMemo } from 'react';
import { EnrichedNotification } from '../types/EnrichedNotification';

export const useNotificationFilters = (notifications: EnrichedNotification[]) => {
  const [typeFilter, setTypeFilter] = useState<'All' | 'Email' | 'SMS'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Sent' | 'Failed' | 'Pending'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((nf) => {
      const matchesType = typeFilter === 'All' ? true : nf.type === typeFilter;
      const matchesStatus = statusFilter === 'All' ? true : nf.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        nf.message.toLowerCase().includes(term) ||
        nf.patientId.toLowerCase().includes(term) ||
        nf.patientName.toLowerCase().includes(term) ||
        nf.notificationId.toLowerCase().includes(term);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [notifications, typeFilter, statusFilter, searchTerm]);

  return {
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    filteredNotifications,
  };
};
