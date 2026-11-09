import { DeleteButton } from '@/src/core/components/ui/DeleteButton';
import { Button } from '@/src/core';
import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Badge } from '@/src/core';
import { EnrichedNotification } from '../types/EnrichedNotification';
import { Mail, MessageSquare, ShieldCheck, AlertTriangle } from 'lucide-react';

interface NotificationTableRowProps {
  notification: EnrichedNotification;
  onEdit: (notification: EnrichedNotification) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

export const NotificationTableRow: React.FC<NotificationTableRowProps> = ({
  notification: nf, onEdit, onDelete, deleting,
}) => {
  const { t, language } = useLanguage();

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
        {nf.notificationId}
      </td>
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {nf.patientName || t('unknown')}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {nf.patientId}</p>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="inline-flex items-center gap-1.5 text-xs">
          {nf.type === 'Email' ? (
            <Mail className="h-4 w-4 text-emerald-500" />
          ) : (
            <MessageSquare className="h-4 w-4 text-sky-500" />
          )}
          {nf.type}
        </span>
      </td>
      <td className="py-4 px-6 text-slate-500 text-xs max-w-sm truncate" title={nf.message}>
        {nf.message}
      </td>
      <td className="py-4 px-6 text-xs text-slate-400">
        {nf.sentOn ? new Date(nf.sentOn).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'}
      </td>
      <td className="py-4 px-6">
        <Badge
          variant={
            nf.status === 'Sent' ? 'success' : nf.status === 'Pending' ? 'warning' : 'error'
          }
        >
          {nf.status === 'Sent'
            ? language === 'ar'
              ? 'تم الإرسال'
              : 'Sent'
            : nf.status === 'Pending'
            ? language === 'ar'
              ? 'قيد الانتظار'
              : 'Pending'
            : language === 'ar'
            ? 'فشل'
            : 'Failed'}
        </Badge>
      </td>
      <td className="py-4 px-6 text-center text-xs">
        {nf.deliveryConfirmation ? (
          <span className="text-emerald-500 font-bold flex items-center justify-center gap-1">
            <ShieldCheck className="h-4 w-4" /> {language === 'ar' ? 'تم التوصيل' : 'Delivered'}
          </span>
        ) : (
          <span className="text-amber-500 font-bold flex items-center justify-center gap-1">
            <AlertTriangle className="h-4 w-4" /> {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
          </span>
        )}
      </td>
      <td className="py-4 px-6">
        {nf.status === 'Pending' && !nf.sentOn && !nf.deliveryConfirmation && <div className="flex items-center">
          <Button variant="ghost" aria-label={t('editNotification')} onClick={() => onEdit(nf)}>{t('editAction')}</Button>
          <DeleteButton name={nf.message} label="Delete notification" disabled={deleting} onDelete={() => onDelete(nf.notificationId)} />
        </div>}
      </td>
    </tr>
  );
};
