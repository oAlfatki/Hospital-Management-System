import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { AuditLog } from '../../users/types/users.types';
import { AuditTableHeader } from './AuditTableHeader';
import { AuditTableRow } from './AuditTableRow';

interface AuditTableProps {
  logs: AuditLog[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <AuditTableHeader />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  {t('noAuditLogsFound')}
                </td>
              </tr>
            ) : (
              logs.map((log) => <AuditTableRow key={log.auditId} log={log} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
