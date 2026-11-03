import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { EnrichedNotification } from '../types/EnrichedNotification';
import { NotificationTableHeader } from './NotificationTableHeader';
import { NotificationTableRow } from './NotificationTableRow';

interface NotificationTableProps {
  notifications: EnrichedNotification[];
}

export const NotificationTable: React.FC<NotificationTableProps> = ({ notifications }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm border-collapse">
          <NotificationTableHeader />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  {t('noNotificationsFound')}
                </td>
              </tr>
            ) : (
              notifications.map((nf) => (
                <NotificationTableRow key={nf.notificationId} notification={nf} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
