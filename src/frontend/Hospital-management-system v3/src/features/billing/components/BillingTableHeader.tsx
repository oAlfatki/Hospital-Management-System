import React from 'react';
import { useLanguage } from '@/src/core/providers';

export const BillingTableHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
        <th className="py-3 px-6">{t('colInvoiceID')}</th>
        <th className="py-3 px-6">{t('patientNameCol')}</th>
        <th className="py-3 px-6">{t('colTotalAmount')}</th>
        <th className="py-3 px-6">{t('colPaidAmount')}</th>
        <th className="py-3 px-6">{t('colBalanceDue')}</th>
        <th className="py-3 px-6">{t('colDueDate')}</th>
        <th className="py-3 px-6">{t('commonStatus')}</th>
        <th className="py-3 px-6 text-center">{t('colActions')}</th>
      </tr>
    </thead>
  );
};
