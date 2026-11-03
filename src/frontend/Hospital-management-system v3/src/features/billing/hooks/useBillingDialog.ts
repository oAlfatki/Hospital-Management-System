import { useState } from 'react';
import { EnrichedBill } from '../types/EnrichedBill';

export const useBillingDialog = () => {
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<EnrichedBill | null>(null);

  const openInvoiceDialog = () => {
    setIsInvoiceOpen(true);
  };

  const closeInvoiceDialog = () => {
    setIsInvoiceOpen(false);
  };

  const openPaymentDialog = (bill: EnrichedBill) => {
    setSelectedBill(bill);
    setIsPaymentOpen(true);
  };

  const closePaymentDialog = () => {
    setIsPaymentOpen(false);
    setSelectedBill(null);
  };

  const openDetailsDialog = (bill: EnrichedBill) => {
    setSelectedBill(bill);
    setIsDetailsOpen(true);
  };

  const closeDetailsDialog = () => {
    setIsDetailsOpen(false);
    setSelectedBill(null);
  };

  return {
    isInvoiceOpen,
    isPaymentOpen,
    isDetailsOpen,
    selectedBill,
    openInvoiceDialog,
    closeInvoiceDialog,
    openPaymentDialog,
    closePaymentDialog,
    openDetailsDialog,
    closeDetailsDialog,
  };
};
