import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Badge, formatCurrency, formatDate } from '@/src/core';
import { EnrichedBill } from '../types/EnrichedBill';
import { Receipt, Landmark, Bell } from 'lucide-react';

interface BillingTableRowProps {
  bill: EnrichedBill;
  onOpenDetails: (bill: EnrichedBill) => void;
  onOpenPayment: (bill: EnrichedBill) => void;
  onSendReminder: (billId: string) => void;
}

export const BillingTableRow: React.FC<BillingTableRowProps> = ({
  bill: b,
  onOpenDetails,
  onOpenPayment,
  onSendReminder,
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">{b.billId}</td>
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{b.patientName}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            {language === 'ar' ? 'المعرف' : 'ID'}: {b.patientId}
          </p>
        </div>
      </td>
      <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
        {formatCurrency(b.totalAmount, locale)}
      </td>
      <td className="py-4 px-6 text-emerald-600 font-semibold">{formatCurrency(b.paidAmount, locale)}</td>
      <td className="py-4 px-6 text-rose-500 font-bold">{formatCurrency(b.pendingDue, locale)}</td>
      <td className="py-4 px-6 text-slate-500 font-semibold">{formatDate(b.dueDate, locale)}</td>
      <td className="py-4 px-6">
        <Badge
          variant={b.status === 'Paid' ? 'success' : b.status === 'Pending' ? 'warning' : 'error'}
        >
          {b.status === 'Paid'
            ? t('commonPaid')
            : b.status === 'Pending'
            ? t('commonPending')
            : b.status === 'Overdue'
            ? t('commonUnpaid')
            : b.status}
        </Badge>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenDetails(b)}
            className="h-8 text-xs font-semibold text-slate-500 hover:text-emerald-500"
          >
            <Receipt className="h-4 w-4 mr-1" />
            {t('invoiceBtn')}
          </Button>

          {b.pendingDue > 0 && b.status !== 'Cancelled' && (
            <>
              <Button
                variant="ghost"
                onClick={() => onOpenPayment(b)}
                className="h-8 text-xs font-semibold text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10"
              >
                <Landmark className="h-4 w-4 mr-1" />
                {t('payBtn')}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSendReminder(b.billId)}
                className="h-8 w-8 text-slate-400 hover:text-amber-500"
                title="Send Reminder Notification"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
