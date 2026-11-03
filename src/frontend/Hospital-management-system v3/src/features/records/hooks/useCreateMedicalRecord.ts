import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordService } from '../services/recordService';
import type { MedicalRecord } from '../types/records.types';
import type { CreateRecordRequest } from '../types/CreateRecordRequest';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, ApiError, CreateRecordRequest>({
    mutationFn: (request) => recordService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_records'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useCreateMedicalRecordMutation = useCreateMedicalRecord;
