import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Dialog, formatDate } from '@/src/core';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';
import { RecordVersion } from '../types/records.types';

interface RecordHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: EnrichedMedicalRecord | null;
}

export const RecordHistoryDialog: React.FC<RecordHistoryDialogProps> = ({
  isOpen,
  onClose,
  selectedRecord,
}) => {
  const { t, language } = useLanguage();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('clinicalDiagnosticVersionHistory')}
      size="lg"
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {t('historicalVersionLedgerFor')}
          </p>
          <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
            {selectedRecord?.patientName} • ID {selectedRecord?.patientId}
          </p>
        </div>

        <div className="space-y-4">
          {/* Current Active Version */}
          <div className="border border-emerald-100 dark:border-emerald-500/10 p-4 rounded-lg bg-emerald-50/20 dark:bg-emerald-500/5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-emerald-100/50 dark:border-emerald-500/10 pb-1.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {t('versionCurrentActive')} {selectedRecord?.version}
              </span>
              <span className="text-xs text-slate-400">
                {t('updatedPrefix')}{' '}
                {selectedRecord
                  ? formatDate(selectedRecord.updatedOn, language === 'ar' ? 'ar-EG' : 'en-US')
                  : ''}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('diagnosisCol')}
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                {selectedRecord?.diagnosis}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('prescribedTreatmentDetails')}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {selectedRecord?.treatment}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('activePrescriptionsDrugLists')}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                {selectedRecord?.prescriptions}
              </p>
            </div>
          </div>

          {/* Historical Versions Comparison List */}
          {selectedRecord?.history.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">
              {t('noPreviousArchivedVersions')}
            </p>
          ) : (
            selectedRecord?.history.map((hist: RecordVersion) => (
              <div
                key={hist.version}
                className="border border-slate-100 dark:border-slate-850 p-4 rounded-lg bg-slate-50/40 dark:bg-slate-950/20 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {t('versionArchived')} {hist.version}
                  </span>
                  <span className="text-xs text-slate-400">
                    {t('updatedPrefix')}{' '}
                    {formatDate(hist.updatedOn, language === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('diagnosisCol')}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                    {hist.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('prescribedTreatmentDetails')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {hist.treatment}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('activePrescriptionsDrugLists')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {hist.prescriptions}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
};
