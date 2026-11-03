import { useState } from 'react';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';

export const useRecordDialog = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EnrichedMedicalRecord | null>(null);

  const openCreateDialog = () => {
    setIsCreateOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
  };

  const openEditDialog = (record: EnrichedMedicalRecord) => {
    setSelectedRecord(record);
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setSelectedRecord(null);
  };

  const openHistoryDialog = (record: EnrichedMedicalRecord) => {
    setSelectedRecord(record);
    setIsHistoryOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryOpen(false);
    setSelectedRecord(null);
  };

  return {
    isCreateOpen,
    isEditOpen,
    isHistoryOpen,
    selectedRecord,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openHistoryDialog,
    closeHistoryDialog,
  };
};
