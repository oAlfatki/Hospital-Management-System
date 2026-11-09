import { useQuery } from "@tanstack/react-query";
import type { Patients } from "../types/Patient";
import { patientService } from "../services/patientService";

// FIX: Unified query key ["patients"] so mutations (create/update/delete)
// can correctly invalidate and trigger UI refresh.
export function usePatients() {
  return useQuery<Patients[]>({
    queryKey: ["patients"],
    queryFn: () => patientService.GetAllPatients(),
  });
}
