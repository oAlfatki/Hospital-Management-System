import { useState, useMemo } from 'react';
import { EnrichedBill } from '../types/EnrichedBill';

export const useBillingFilters = (bills: EnrichedBill[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBills = useMemo(() => {
    if (!searchTerm.trim()) return bills;
    const term = searchTerm.toLowerCase();
    return bills.filter(
      (b) =>
        b.billId.toLowerCase().includes(term) ||
        b.patientName.toLowerCase().includes(term) ||
        b.patientId.toLowerCase().includes(term) ||
        b.contactNumber.includes(term)
    );
  }, [bills, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredBills,
  };
};
