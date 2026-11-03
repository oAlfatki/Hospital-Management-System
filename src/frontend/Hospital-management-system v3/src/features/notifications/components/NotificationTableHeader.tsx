import React from 'react';
import { useLanguage } from '@/src/core/providers';

export const NotificationTableHeader: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
        <th className="py-3 px-6">{t('colNotificationID')}</th>
        <th className="py-3 px-6">{language === 'ar' ? 'المريض' : 'Patient'}</th>
        <th className="py-3 px-6">{t('colType')}</th>
        <th className="py-3 px-6">{t('colPayloadDetails')}</th>
        <th className="py-3 px-6">{t('colDispatchedOn')}</th>
        <th className="py-3 px-6">{t('colStatus')}</th>
        <th className="py-3 px-6 text-center">{language === 'ar' ? 'تأكيد الاستلام' : 'Receipt Confirmation'}</th>
      </tr>
    </thead>
  );
};
