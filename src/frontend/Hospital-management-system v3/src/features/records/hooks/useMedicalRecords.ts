import { useQuery } from '@tanstack/react-query';
import { recordService } from '../services/recordService';
import type { MedicalRecord } from '../types/records.types';
import { useAuth } from '@/src/core/providers';

export function useMedicalRecords() {
  const { user } = useAuth();
  return useQuery<MedicalRecord[]>({
    queryKey: ['medical_records', user?.userId],
    queryFn: () => recordService.getAll(),
    enabled: !!user && (user.role === 'Doctor' || user.role === 'Nurse' || user.role === 'Admin'),
  });
}
