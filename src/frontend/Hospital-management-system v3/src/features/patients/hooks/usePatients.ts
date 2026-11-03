import { useQuery } from "@tanstack/react-query";
import type { Patient } from "../types/Patient";
import { patientService } from "../services/patientService";

// FIX: Unified query key ["patients"] so mutations (create/update/delete)
// can correctly invalidate and trigger UI refresh.
export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: () => patientService.getAll(),
  });
}
