import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordService } from '../services/recordService';
import type { MedicalRecord } from '../types/records.types';
import type { UpdateRecordRequest } from '../types/UpdateRecordRequest';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, ApiError, UpdateRecordRequest>({
    mutationFn: (request) => recordService.update(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['medical_records'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useUpdateMedicalRecordMutation = useUpdateMedicalRecord;
