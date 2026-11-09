import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { EnrichedBill } from '../types/EnrichedBill';
import { BillingTableHeader } from './BillingTableHeader';
import { BillingTableRow } from './BillingTableRow';

interface BillingTableProps {
  bills: EnrichedBill[];
  onEdit: (bill: EnrichedBill) => void;
  onDelete?: (id: string) => void;
  deleting: boolean;
  onOpenDetails: (bill: EnrichedBill) => void;
  onOpenPayment: (bill: EnrichedBill) => void;
  onSendReminder: (billId: string) => void;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  bills,
  onOpenDetails,
  onOpenPayment,
  onSendReminder, onEdit, onDelete, deleting,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <BillingTableHeader />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {bills.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                  {t('noMatchingInvoicesFound')}
                </td>
              </tr>
            ) : (
              bills.map((b) => (
                <BillingTableRow
                  key={b.billId}
                  bill={b}
                  onOpenDetails={onOpenDetails}
                  onOpenPayment={onOpenPayment}
                  onSendReminder={onSendReminder} onEdit={onEdit} onDelete={onDelete} deleting={deleting}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
