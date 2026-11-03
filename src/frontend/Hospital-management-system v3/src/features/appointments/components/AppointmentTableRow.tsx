import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Badge, formatDate, formatTime } from '@/src/core';
import { EnrichedAppointment } from '../types/EnrichedAppointment';

interface AppointmentTableRowProps {
  appointment: EnrichedAppointment;
  onOpenReschedule: (appt: EnrichedAppointment) => void;
  onCancel: (apptId: string) => void;
}

export const AppointmentTableRow: React.FC<AppointmentTableRowProps> = ({
  appointment: appt,
  onOpenReschedule,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <tr
      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
        appt.status === 'Cancelled' ? 'opacity-60' : ''
      }`}
    >
      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
        {appt.appointmentId}
      </td>
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{appt.patientName}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{appt.patientId}</p>
        </div>
      </td>
      <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
        {appt.doctorName}
      </td>
      <td className="py-4 px-6">
        <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium">
          {appt.specialty}
        </span>
      </td>
      <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
        {formatDate(appt.appointmentDate, locale)} {t('commonAt')}{' '}
        <span className="text-emerald-500">{formatTime(appt.appointmentTime, locale)}</span>
      </td>
      <td className="py-4 px-6 text-slate-500 font-semibold">
        {appt.durationMinutes} {t('commonMinutes')}
      </td>
      <td className="py-4 px-6">
        <Badge
          variant={
            appt.status === 'Scheduled'
              ? 'success'
              : appt.status === 'Rescheduled'
              ? 'warning'
              : 'neutral'
          }
        >
          {appt.status === 'Scheduled'
            ? t('commonScheduled')
            : appt.status === 'Rescheduled'
            ? t('commonRescheduled')
            : appt.status === 'Cancelled'
            ? t('commonCancelled')
            : appt.status}
        </Badge>
      </td>
      <td className="py-4 px-6">
        {appt.status !== 'Cancelled' ? (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="ghost"
              onClick={() => onOpenReschedule(appt)}
              className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 px-2 py-1 text-xs font-semibold rounded"
            >
              {t('reschedule')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onCancel(appt.appointmentId)}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-2 py-1 text-xs font-semibold rounded"
            >
              {t('commonCancel')}
            </Button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 italic font-medium">
            {t('noActionsPossible')}
          </div>
        )}
      </td>
    </tr>
  );
};
