import React from 'react';
import { useLanguage } from '@/src/core/providers';

export const AuditTableHeader: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
        <th className="py-3 px-6">{t('colAuditID')}</th>
        <th className="py-3 px-6">{t('colUserID')}</th>
        <th className="py-3 px-6">{t('colModuleAffected')}</th>
        <th className="py-3 px-6">{t('colActionPerformed')}</th>
        <th className="py-3 px-6">{t('colDetailedLogDescription')}</th>
        <th className="py-3 px-6">{t('colTimestamp')}</th>
        <th className="py-3 px-6 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
      </tr>
    </thead>
  );
};
