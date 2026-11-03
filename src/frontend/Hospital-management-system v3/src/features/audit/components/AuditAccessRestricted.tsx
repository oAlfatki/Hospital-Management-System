import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { ShieldAlert } from 'lucide-react';

export const AuditAccessRestricted: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center max-w-xl mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl rounded-xl mt-12">
      <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
        <ShieldAlert className="h-9 w-9" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {t('adminSecurityAccessProtected')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('systemCoreAuditTrailsRestricted')}
        </p>
      </div>
    </div>
  );
};
