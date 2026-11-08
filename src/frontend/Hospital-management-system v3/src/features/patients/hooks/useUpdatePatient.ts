import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patientService";
import type { Patients } from "../types/Patient";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";
import type { ApiError } from "../../../core/Errors/ApiError";

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation<Patients, ApiError, UpdatePatientRequest>({
    mutationFn: patientService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
    },
  });
}