import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patientService";
import type { Patients } from "../types/Patient";
import type { ApiError } from "../../../core/Errors/ApiError";
import type { CreatePatientRequest } from "../types/CreatePatientRequest";

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation<Patients, ApiError, CreatePatientRequest>({
    mutationFn: patientService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
    },
  });
}
