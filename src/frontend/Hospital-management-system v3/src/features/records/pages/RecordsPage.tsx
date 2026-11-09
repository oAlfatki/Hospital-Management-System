import React, { useMemo, useEffect } from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button, PageHeader, FilterBar, SearchInput, LoadingState, ErrorState } from '@/src/core';
import { Plus } from 'lucide-react';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { usePatients } from '@/src/features/patients';
import { recordService } from '../services/recordService';

import { useRecordDialog } from '../hooks/useRecordDialog';
import { useRecordFilters } from '../hooks/useRecordFilters';
import { useCreateRecordForm } from '../hooks/useCreateRecordForm';
import { useEditRecordForm } from '../hooks/useEditRecordForm';

import { RecordCard } from '../components/RecordCard';
import { CreateRecordDialog } from '../components/CreateRecordDialog';
import { EditRecordDialog } from '../components/EditRecordDialog';
import { RecordHistoryDialog } from '../components/RecordHistoryDialog';
import { RecordAccessRestricted } from '../components/RecordAccessRestricted';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';

export const RecordsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const isAuthorized = !!user && (user.role === 'Doctor' || user.role === 'Nurse');

  const { data: rawRecords = [], isLoading: isRecordsLoading, error: recordsError } = useMedicalRecords();
  const { data: patientsData, isLoading: isPatientsLoading } = usePatients();
  const patients = patientsData || [];

  const dialog = useRecordDialog();

  const enrichedRecords = useMemo<EnrichedMedicalRecord[]>(() => {
    return rawRecords.map((r) => {
      const pat = patients.find((p) => p.patientId === r.patientId);
      return {
        ...r,
        patientName: pat ? pat.name : t('unknownPatient'),
        contactNumber: pat ? pat.contactNumber : '',
      };
    });
  }, [rawRecords, patients, t]);

  const filters = useRecordFilters(enrichedRecords);

  const createForm = useCreateRecordForm({
    onSuccess: () => dialog.closeCreateDialog(),
    defaultPatientId: patients[0]?.patientId || '',
  });

  const editForm = useEditRecordForm({
    selectedRecord: dialog.selectedRecord,
    onSuccess: () => dialog.closeEditDialog(),
  });

  if (isRecordsLoading || isPatientsLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (recordsError) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  // Access Denied Shield Page if not authorized
  if (!isAuthorized) {
    return <RecordAccessRestricted />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('medicalRecordsManagement')}
        description={t('medicalRecordsManagementDesc')}
      >
        <Button
          onClick={() => {
            createForm.resetForm(patients[0]?.patientId || '');
            dialog.openCreateDialog();
          }}
          className="gap-2 h-9 text-xs"
        >
          <Plus className="h-4 w-4" />
          {t('newClinicalFile')}
        </Button>
      </PageHeader>

      {/* Search Filter */}
      <FilterBar>
        <SearchInput
          value={filters.searchTerm}
          onChange={filters.setSearchTerm}
          placeholder={t('quickSearchRecordsPlaceholder')}
        />
      </FilterBar>

      {/* Record Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filters.filteredRecords.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-855 font-medium">
            {t('noClinicalRecordsMatching')}
          </div>
        ) : (
          filters.filteredRecords.map((rec) => (
            <RecordCard
              key={rec.recordId}
              record={rec}
              onOpenHistory={dialog.openHistoryDialog}
              onOpenEdit={dialog.openEditDialog}
            />
          ))
        )}
      </div>

      {/* Create Medical Record Dialog */}
      <CreateRecordDialog
        isOpen={dialog.isCreateOpen}
        onClose={dialog.closeCreateDialog}
        patients={patients}
        form={createForm.form}
        onSubmit={createForm.onSubmit}
        isSubmitting={createForm.isSubmitting}
      />

      {/* Edit Medical Record Dialog */}
      <EditRecordDialog
        isOpen={dialog.isEditOpen}
        onClose={dialog.closeEditDialog}
        selectedRecord={dialog.selectedRecord}
        form={editForm.form}
        onSubmit={editForm.onSubmit}
        isSubmitting={editForm.isSubmitting}
      />

      {/* Historical Versioning Dialog */}
      <RecordHistoryDialog
        isOpen={dialog.isHistoryOpen}
        onClose={dialog.closeHistoryDialog}
        selectedRecord={dialog.selectedRecord}
      />
    </div>
  );
};
