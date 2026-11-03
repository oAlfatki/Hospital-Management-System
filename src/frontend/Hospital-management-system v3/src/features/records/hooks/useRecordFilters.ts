import { useState, useMemo } from 'react';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';

export const useRecordFilters = (records: EnrichedMedicalRecord[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.patientName.toLowerCase().includes(term) ||
        r.patientId.toLowerCase().includes(term) ||
        r.contactNumber.includes(term) ||
        r.recordId.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredRecords,
  };
};
