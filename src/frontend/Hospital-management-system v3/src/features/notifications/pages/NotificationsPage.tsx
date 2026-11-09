import { useDeleteNotification } from '../hooks/useDeleteNotification';
import { EditNotificationDialog } from '../components/EditNotificationDialog';
import type { NotificationLog } from '../types/notifications.types';
import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/src/core/providers';
import { Select, PageHeader, FilterBar, SearchInput, LoadingState, ErrorState } from '@/src/core';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationFilters } from '../hooks/useNotificationFilters';
import { usePatients } from '@/src/features/patients';
import { NotificationTable } from '../components/NotificationTable';
import { EnrichedNotification } from '../types/EnrichedNotification';

export const NotificationsPage: React.FC = () => {
  const { t, language } = useLanguage();

  const { data: rawNotifications = [], isLoading, error } = useNotifications();
  const { data: patientsData } = usePatients();
  const patients = patientsData || [];

  const enrichedNotifications = useMemo<EnrichedNotification[]>(() => {
    return rawNotifications.map((nf) => {
      const pat = patients.find((p) => p.patientId === nf.patientId);
      return {
        ...nf,
        patientName: pat ? pat.name : 'Unknown',
      };
    });
  }, [rawNotifications, patients]);

  const filters = useNotificationFilters(enrichedNotifications);
  const deletion = useDeleteNotification();
  const [editing, setEditing] = useState<NotificationLog | null>(null);

  if (isLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (error) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('systemNotificationsLedger')}
        description={t('automatedPatientReminders')}
      />

      {/* Filter Options */}
      <FilterBar>
        <SearchInput
          value={filters.searchTerm}
          onChange={filters.setSearchTerm}
          placeholder={t('searchNotificationLogs')}
        />
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Select
            options={[
              { value: 'All', label: language === 'ar' ? 'جميع أنواع الوسائط' : 'All Media Types' },
              { value: 'Email', label: 'Email' },
              { value: 'SMS', label: 'SMS' },
            ]}
            value={filters.typeFilter}
            onChange={(e) => filters.setTypeFilter(e.target.value as 'All' | 'Email' | 'SMS')}
            className="mb-0 w-full sm:w-44"
          />
          <Select
            options={[
              { value: 'All', label: t('commonAllStatuses') },
              { value: 'Sent', label: language === 'ar' ? 'تم الإرسال' : 'Sent' },
              { value: 'Failed', label: language === 'ar' ? 'فشل الإرسال' : 'Failed' },
              { value: 'Pending', label: language === 'ar' ? 'معلق' : 'Pending' },
            ]}
            value={filters.statusFilter}
            onChange={(e) =>
              filters.setStatusFilter(e.target.value as 'All' | 'Sent' | 'Failed' | 'Pending')
            }
            className="mb-0 w-full sm:w-44"
          />
        </div>
      </FilterBar>

      {/* Log list */}
      <NotificationTable notifications={filters.filteredNotifications} onEdit={setEditing} onDelete={id => deletion.mutate(id)} deleting={deletion.isPending} />
      <EditNotificationDialog notification={editing} onClose={() => setEditing(null)} />
    </div>
  );
};
