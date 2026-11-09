import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Badge, formatDate } from '@/src/core';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';
import { CheckCircle, History, Edit2 } from 'lucide-react';

interface RecordCardProps {
  record: EnrichedMedicalRecord;
  onOpenHistory: (record: EnrichedMedicalRecord) => void;
  onOpenEdit: (record: EnrichedMedicalRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record: rec,
  onOpenHistory,
  onOpenEdit,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden flex flex-col">
      {/* Card Ribbon header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            {rec.patientName}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            {language === 'ar' ? 'معرف المريض' : 'Patient ID'}: {rec.patientId} •{' '}
            {language === 'ar' ? 'السجل' : 'Record'}: {rec.recordId}
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-bold">
          <Badge variant="info">v{rec.version}</Badge>
          <Badge variant={rec.status === 'Active' ? 'success' : 'neutral'}>
            {rec.status === 'Active' ? t('commonActive') : t('commonArchived')}
          </Badge>
        </div>
      </div>

      {/* Clinical diagnostics and treatments details */}
      <div className="space-y-3 flex-1 font-medium">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t('diagnosisCol')}
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded border border-slate-100 dark:border-slate-850">
            {rec.diagnosis}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t('treatmentPlanCol')}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
            {rec.treatment || t('noActiveTherapySpecified')}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t('activePrescriptionsCol')}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono line-clamp-1">
            {rec.prescriptions || t('noDrugsPrescribed')}
          </p>
        </div>
      </div>

      {/* Persisted clinical version history */}
      <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/5 px-2 py-1 rounded inline-flex items-center gap-1 w-max">
        <CheckCircle className="h-3 w-3" /> {t('secureAesEncryptedFootnote')}
      </p>

      {/* Action buttons */}
      <div className="border-t border-slate-50 dark:border-slate-850 pt-3.5 flex items-center justify-between font-bold">
        <p className="text-[10px] text-slate-400 font-semibold">
          {t('lastUpdatedPrefix')}{' '}
          {formatDate(rec.updatedOn, language === 'ar' ? 'ar-EG' : 'en-US')}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={() => onOpenHistory(rec)}
            className="h-8 gap-1.5 px-3 text-xs text-slate-500 hover:text-emerald-500"
          >
            <History className="h-3.5 w-3.5" />
            {t('vHistoryBtn')} ({rec.history.length})
          </Button>
          <Button
            variant="secondary"
            onClick={() => onOpenEdit(rec)}
            className="h-8 gap-1.5 px-3 text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {t('modifyRecordBtn')}
          </Button>
        </div>
      </div>
    </div>
  );
};
