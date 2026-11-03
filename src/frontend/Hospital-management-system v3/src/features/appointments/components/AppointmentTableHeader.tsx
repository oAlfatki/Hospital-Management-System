import React from 'react';
import { useLanguage } from '@/src/core/providers';

export const AppointmentTableHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
        <th className="py-3 px-6">{t('colAppointmentID')}</th>
        <th className="py-3 px-6">{t('patientNameCol')}</th>
        <th className="py-3 px-6">{t('colAssignedDoctor')}</th>
        <th className="py-3 px-6">{t('colSpecialty')}</th>
        <th className="py-3 px-6">{t('colDateTime')}</th>
        <th className="py-3 px-6">{t('colDuration')}</th>
        <th className="py-3 px-6">{t('commonStatus')}</th>
        <th className="py-3 px-6 text-center">{t('colActions')}</th>
      </tr>
    </thead>
  );
};
