import React from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { ShieldAlert, Lock } from 'lucide-react';

export const RecordAccessRestricted: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center max-w-xl mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl rounded-xl mt-12">
      <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
        <ShieldAlert className="h-9 w-9" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {t('rbacProtectedClinicalRecords')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('rbacProtectedClinicalRecordsDesc')}
        </p>
      </div>
      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/45 rounded-lg border border-slate-100 dark:border-slate-850 w-full text-left">
        <div className="flex items-center gap-2.5 text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">
          <Lock className="h-4 w-4" />
          {t('securityAuditAlert')}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('unauthorizedLogAlert')}{' '}
          <span className="font-semibold font-mono text-rose-500">{user?.userId}</span>.
        </p>
      </div>
    </div>
  );
};
