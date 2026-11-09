import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { EnrichedAppointment } from '../types/EnrichedAppointment';
import { AppointmentTableHeader } from './AppointmentTableHeader';
import { AppointmentTableRow } from './AppointmentTableRow';

interface AppointmentTableProps {
  appointments: EnrichedAppointment[];
  onOpenReschedule: (appt: EnrichedAppointment) => void;
  onCancel: (apptId: string) => void;
  onEdit: (appt: EnrichedAppointment) => void;
  onDelete?: (id: string) => void;
  deleting: boolean;
  canWrite: boolean;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  onOpenReschedule,
  onCancel, onEdit, onDelete, deleting, canWrite,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <AppointmentTableHeader />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  {t('noClinicalAppointmentsFound')}
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <AppointmentTableRow
                  key={appt.appointmentId}
                  appointment={appt}
                  onOpenReschedule={onOpenReschedule}
                  onCancel={onCancel} onEdit={onEdit} onDelete={onDelete} deleting={deleting} canWrite={canWrite}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
