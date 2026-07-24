import { useQuery } from "@tanstack/react-query";
import type { Patient } from "../types/Patient";
import { patientService } from "../services/patientService";
import type { Paginated } from "../../../core/types/PaginatedResponse";

export function usePatients(pageNumber: number, pageSize: number) {
  return useQuery<Paginated<Patient>>({
    queryKey: [`patients-list-page-${pageNumber}-${pageSize}`],
    queryFn: () => patientService.getAll(pageNumber, pageSize),
  });
}
