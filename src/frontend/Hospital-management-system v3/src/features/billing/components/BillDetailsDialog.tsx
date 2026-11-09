import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Badge, Dialog, formatCurrency, formatDate } from '@/src/core';
import { EnrichedBill } from '../types/EnrichedBill';
import { ServiceItem } from '../types/billing.types';

interface BillDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBill: EnrichedBill | null;
}

export const BillDetailsDialog: React.FC<BillDetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedBill,
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('clinicalInvoiceReceipt')}
      size="md"
    >
      {selectedBill && (
        <div className="space-y-6 text-sm text-slate-800 dark:text-slate-200 font-sans" id="printable-invoice">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t('hospitalManagementSystem')}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {t('inpatientOutpatientLedgerServices')}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={selectedBill.status === 'Paid' ? 'success' : 'warning'}>
                {selectedBill.status === 'Paid' ? t('commonPaid') : t('commonPending')}
              </Badge>
              <p className="text-xs font-mono font-bold mt-1.5 text-slate-500">
                {selectedBill.billId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider">{t('patientParticulars')}:</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedBill.patientName}</p>
              <p className="text-slate-500 mt-0.5">{t('patientIdLabel')} {selectedBill.patientId}</p>
              <p className="text-slate-500 mt-0.5">{t('phoneLabel')} {selectedBill.contactNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-400 uppercase tracking-wider">{t('invoicingDetails')}:</p>
              <p className="mt-1 text-slate-500">
                {t('dateGenerated')} {formatDate(selectedBill.createdOn, locale)}
              </p>
              <p className="text-slate-500">
                {t('dueDateLabel')}{' '}
                <span className="font-semibold text-rose-500">
                  {formatDate(selectedBill.dueDate, locale)}
                </span>
              </p>
              <p className="text-slate-500">{t('generatedBy')} {selectedBill.createdBy}</p>
            </div>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-500">
                  <th className="py-2.5 px-4">{t('serviceProvidedCol')}</th>
                  <th className="py-2.5 px-4 text-right">{t('feeCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {(selectedBill.services ??[]).map((item: ServiceItem, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {item.serviceName}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                      {formatCurrency(item.cost, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col items-end space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between w-48 text-slate-500">
              <span>{t('subtotalLabel')}</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {formatCurrency(selectedBill.subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between w-48 text-slate-500">
              <span>{t('taxLabel')} ({selectedBill.taxPercent}%):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                +{formatCurrency((selectedBill.subtotal * selectedBill.taxPercent) / 100, locale)}
              </span>
            </div>
            {selectedBill.discountAmount > 0 && (
              <div className="flex justify-between w-48 text-slate-500">
                <span>{t('discountLabel')}</span>
                <span className="font-mono text-emerald-500">
                  -{formatCurrency(selectedBill.discountAmount, locale)}
                </span>
              </div>
            )}
            <div className="flex justify-between w-48 font-bold border-t border-slate-150 dark:border-slate-800 pt-1.5 text-sm text-slate-950 dark:text-white">
              <span>{t('totalAmountLabel')}</span>
              <span className="font-mono">{formatCurrency(selectedBill.totalAmount, locale)}</span>
            </div>
            <div className="flex justify-between w-48 text-emerald-600 border-b border-slate-150 dark:border-slate-800 pb-1.5">
              <span>{t('amountPaidLabel')}</span>
              <span className="font-mono">-{formatCurrency(selectedBill.paidAmount, locale)}</span>
            </div>
            <div className="flex justify-between w-48 font-bold text-sm text-rose-500">
              <span>{t('balanceDueLabel')}</span>
              <span className="font-mono">{formatCurrency(selectedBill.pendingDue, locale)}</span>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
            <p>{t('invoiceReceiptFooterText1')}</p>
            <p className="mt-1 font-mono">{t('invoiceReceiptFooterText2')}</p>
          </div>
        </div>
      )}
    </Dialog>
  );
};
