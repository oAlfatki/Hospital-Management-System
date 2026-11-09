import React from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button, Select, PageHeader, FilterBar, SearchInput, LoadingState, ErrorState } from '@/src/core';
import { FileDown } from 'lucide-react';
import { auditService } from '../services/auditService';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useAuditFilters } from '../hooks/useAuditFilters';
import { AuditTable } from '../components/AuditTable';
import { AuditAccessRestricted } from '../components/AuditAccessRestricted';

export const AuditPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const { data: logs = [], isLoading, error } = useAuditLogs();
  const filters = useAuditFilters(logs);

  const handleExportCSV = () => {
    const headers = [
      t('colAuditID'),
      t('colUserID'),
      language === 'ar' ? 'اسم المستخدم' : 'User Name',
      t('colModuleAffected'),
      t('colActionPerformed'),
      t('colTimestamp'),
      t('colDetailedLogDescription'),
    ];
    const csvContent = auditService.exportToCSV(filters.filteredLogs, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `hms_system_audit_log_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (error) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  // RBAC block
  if (user?.role !== 'Admin' && user?.role !== 'Management') {
    return <AuditAccessRestricted />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('systemAuditLogs')}
        description={t('secureTamperProofLedger')}
      >
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="gap-2 h-9 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
        >
          <FileDown className="h-4 w-4 text-slate-400" />
          {t('exportAuditSpreadsheet')}
        </Button>
      </PageHeader>

      {/* Searching Filters */}
      <FilterBar>
        <SearchInput
          value={filters.searchTerm}
          onChange={filters.setSearchTerm}
          placeholder={t('searchAuditTrail')}
        />
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Select
            options={[
              { value: 'All', label: t('allModules') },
              { value: 'Patient', label: t('patientsDirectory') },
              { value: 'Appointment', label: t('appointments') },
              { value: 'MedicalRecord', label: t('medicalRecords') },
              { value: 'Billing', label: t('billingInvoicing') },
              { value: 'User', label: t('userManagement') },
              { value: 'Doctor', label: t('doctorsStaff') },
            ]}
            value={filters.entityFilter}
            onChange={(e) => filters.setEntityFilter(e.target.value)}
            className="mb-0 w-full sm:w-44"
          />
          <Select
            options={[
              { value: 'All', label: t('allActions') },
              { value: 'Create', label: language === 'ar' ? 'إنشاء' : 'Create' },
              { value: 'Update', label: language === 'ar' ? 'تعديل' : 'Update' },
              { value: 'Delete', label: language === 'ar' ? 'حذف' : 'Delete' },
              { value: 'Access', label: language === 'ar' ? 'وصول' : 'Access' },
              { value: 'Login', label: language === 'ar' ? 'دخول' : 'Login' },
              { value: 'Logout', label: language === 'ar' ? 'خروج' : 'Logout' },
            ]}
            value={filters.actionFilter}
            onChange={(e) => filters.setActionFilter(e.target.value)}
            className="mb-0 w-full sm:w-44"
          />
        </div>
      </FilterBar>

      {/* Audit Log Table */}
      <AuditTable logs={filters.filteredLogs} />
    </div>
  );
};
