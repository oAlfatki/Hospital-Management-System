import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Badge } from '@/src/core';
import { AuditLog } from '../../users/types/users.types';

interface AuditTableRowProps {
  log: AuditLog;
}

export const AuditTableRow: React.FC<AuditTableRowProps> = ({ log }) => {
  const { t, language } = useLanguage();

  const getEntityLabel = (entity: string) => {
    switch (entity) {
      case 'Patient':
        return t('patientsDirectory');
      case 'Appointment':
        return t('appointments');
      case 'MedicalRecord':
        return t('medicalRecords');
      case 'Billing':
        return t('billingInvoicing');
      case 'User':
        return t('userManagement');
      case 'Doctor':
        return t('doctorsStaff');
      default:
        return entity;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'Create':
        return language === 'ar' ? 'إنشاء' : 'Create';
      case 'Update':
        return language === 'ar' ? 'تعديل' : 'Update';
      case 'Delete':
        return language === 'ar' ? 'حذف' : 'Delete';
      case 'Access':
        return language === 'ar' ? 'وصول' : 'Access';
      case 'Login':
        return language === 'ar' ? 'دخول' : 'Login';
      case 'Logout':
        return language === 'ar' ? 'خروج' : 'Logout';
      default:
        return action;
    }
  };

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">{log.auditId}</td>
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{log.userName}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{log.userId}</p>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {getEntityLabel(log.entity)}
        </span>
      </td>
      <td className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">
        {getActionLabel(log.action)}
      </td>
      <td className="py-4 px-6 text-slate-500 text-xs truncate max-w-sm" title={log.details}>
        {log.details}
      </td>
      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
        {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
      </td>
      <td className="py-4 px-6 text-center">
        <Badge variant="success">{t('colStatusSecure')}</Badge>
      </td>
    </tr>
  );
};
