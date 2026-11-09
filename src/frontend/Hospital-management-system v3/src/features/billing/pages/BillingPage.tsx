import React, { useMemo } from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button, useToast, LoadingState, ErrorState, PageHeader, FilterBar, SearchInput } from '@/src/core';
import { Plus, FileDown } from 'lucide-react';
import { useBills } from '../hooks/useBills';
import { useSendBillReminderMutation } from '../hooks/useSendBillReminder';
import { usePatients } from '@/src/features/patients';
import { billingService } from '../services/billingService';

import { useBillingDialog } from '../hooks/useBillingDialog';
import { useBillingFilters } from '../hooks/useBillingFilters';
import { useBillingForm } from '../hooks/useBillingForm';
import { usePaymentForm } from '../hooks/usePaymentForm';

import { BillingTable } from '../components/BillingTable';
import { CreateBillDialog } from '../components/CreateBillDialog';
import { RecordPaymentDialog } from '../components/RecordPaymentDialog';
import { BillDetailsDialog } from '../components/BillDetailsDialog';
import { EnrichedBill } from '../types/EnrichedBill';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: rawBills = [], isLoading: isBillsLoading, error: billsError } = useBills();
  const { data: patientsData, isLoading: isPatientsLoading } = usePatients();
  const patients = patientsData || [];

  const sendReminderMutation = useSendBillReminderMutation();

  const dialog = useBillingDialog();

  // Enriched bills calculation
  const enrichedBills = useMemo<EnrichedBill[]>(() => {
    return rawBills.map((b) => {
      const pat = patients.find((p) => p.patientId === b.patientId);
      return {
        ...b,
        patientName: pat ? pat.name : t('unknownPatient'),
        contactNumber: pat ? pat.contactNumber : '',
      };
    });
  }, [rawBills, patients, t]);

  const filters = useBillingFilters(enrichedBills);

  const billingForm = useBillingForm({
    onSuccess: () => dialog.closeInvoiceDialog(),
    defaultPatientId: patients[0]?.patientId || '',
  });

  const paymentForm = usePaymentForm({
    selectedBill: dialog.selectedBill,
    onSuccess: () => dialog.closePaymentDialog(),
  });

  const handleSendReminder = (billId: string) => {
    if (!user) return;
    sendReminderMutation.mutate(
      billId,
      {
        onSuccess: () => {
          toast.success(t('toastBillingReminderSent'));
        },
        onError: (err: Error) => {
          toast.error(err.message || t('toastFailedSendReminder'));
        },
      }
    );
  };

  const handleExportCSV = () => {
    try {
      const csv = billingService.exportToCSV(enrichedBills, patients);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `HMS_Billing_Ledger_Report_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t('toastBillingReportExported'));
    } catch {
      toast.error(t('toastFailedExportCsv'));
    }
  };

  if (isBillsLoading || isPatientsLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (billsError) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Page Header */}
      <PageHeader
        title={t('billingAndPayments')}
        description={t('billingAndPaymentsDesc')}
      >
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 h-9 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          >
            <FileDown className="h-4 w-4 text-slate-400" />
            {t('exportCsvReport')}
          </Button>
          <Button
            onClick={() => {
              billingForm.resetForm(patients[0]?.patientId || '');
              dialog.openInvoiceDialog();
            }}
            className="gap-2 h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            {t('generateBill')}
          </Button>
        </div>
      </PageHeader>

      {/* Filter and Search controls */}
      <FilterBar>
        <SearchInput
          value={filters.searchTerm}
          onChange={filters.setSearchTerm}
          placeholder={t('searchBillingRecordsPlaceholder')}
        />
      </FilterBar>

      {/* Invoicing Ledger Table */}
      <BillingTable
        bills={filters.filteredBills}
        onOpenDetails={dialog.openDetailsDialog}
        onOpenPayment={dialog.openPaymentDialog}
        onSendReminder={handleSendReminder}
      />

      {/* Dialogs */}
      <CreateBillDialog
        isOpen={dialog.isInvoiceOpen}
        onClose={dialog.closeInvoiceDialog}
        patients={patients}
        form={billingForm.form}
        servicesList={billingForm.servicesList}
        newItemName={billingForm.newItemName}
        setNewItemName={billingForm.setNewItemName}
        newItemCost={billingForm.newItemCost}
        setNewItemCost={billingForm.setNewItemCost}
        addServiceItem={billingForm.addServiceItem}
        removeServiceItem={billingForm.removeServiceItem}
        onSubmit={billingForm.onSubmit}
        isSubmitting={billingForm.isSubmitting}
      />

      <RecordPaymentDialog
        isOpen={dialog.isPaymentOpen}
        onClose={dialog.closePaymentDialog}
        selectedBill={dialog.selectedBill}
        form={paymentForm.form}
        onSubmit={paymentForm.onSubmit}
        isSubmitting={paymentForm.isSubmitting}
      />

      <BillDetailsDialog
        isOpen={dialog.isDetailsOpen}
        onClose={dialog.closeDetailsDialog}
        selectedBill={dialog.selectedBill}
      />
    </div>
  );
};
