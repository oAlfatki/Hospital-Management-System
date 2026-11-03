import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { RegisterPatientSchema } from "../validation/RegisterPatientSchema";
import { PatientMapper } from "../mappers/patientMapper";

import { useCreatePatient } from "./useCreatePatient";
import { useUpdatePatient } from "./useUpdatePatient";

import type { Patient } from "../types/Patient";
import type { IPatientFormInput } from "../types/IRegisterPatientFormInput";
import { useLanguage } from "../../../core/providers/LanguageProvider";

interface UsePatientFormProps {
  mode: "create" | "edit";
  selectedPatient: Patient | null;
  page?: number;
  pageSize?: number;
  onSuccess: () => void;
}

export function usePatientForm({
  mode,
  selectedPatient,
  onSuccess,
}: UsePatientFormProps) {
  const { t } = useLanguage();

  const queryClient = useQueryClient();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const form = useForm<IPatientFormInput>({
    resolver: yupResolver(RegisterPatientSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: "Male",
      contactNumber: "",
      email: "",
      address: "",
      medicalHistory: "",
      status: "Active",
    },
  });

  const { reset, setError } = form;

  const resetForm = () => {
    reset({
      name: "",
      dateOfBirth: "",
      gender: "Male",
      contactNumber: "",
      email: "",
      address: "",
      medicalHistory: "",
      status: "Active",
    });
  };

  const loadPatient = (patient: Patient) => {
    reset({
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      email: patient.email,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      status: patient.status,
    });
  };

  const onSubmit: SubmitHandler<IPatientFormInput> = async (data) => {
    if (mode === "create") {
      await createPatient.mutate(PatientMapper.toCreateRequest(data), {
        onSuccess() {
          toast.success(t("toastPatientRegistered"));
          onSuccess();
        },
        onError(error) {
          if (error.isValidationError && error.fieldErrors) {
            Object.entries(error.fieldErrors).forEach(([field, messages]) => {
              setError(field as keyof IPatientFormInput, {
                type: "server",
                message: messages[0],
              });
            });

            return;
          }

          toast.error(error.message);
        },
      });

      return;
    }

    await updatePatient.mutate(
      PatientMapper.toUpdateRequest(selectedPatient?.patientId ?? "", data),
      {
        onSuccess(updatedPatient) {
          toast.success(t("toastPatientUpdated"));

          // FIX: Use unified "patients" query key (not the old paginated key)
          queryClient.setQueryData(
            ["patients"],
            (oldData: Patient[] | undefined) => {
              if (!oldData) return oldData;
              return oldData.map((patient) =>
                patient.patientId === updatedPatient.patientId
                  ? updatedPatient
                  : patient
              );
            }
          );

          onSuccess();
        },
        onError(error) {
          if (error.isValidationError && error.fieldErrors) {
            Object.entries(error.fieldErrors).forEach(([field, messages]) => {
              setError(field as keyof IPatientFormInput, {
                type: "server",
                message: messages[0],
              });
            });

            return;
          }

          toast.error(error.message);
        },
      }
    );
  };

  return {
    form,

    resetForm,

    loadPatient,

    onSubmit,

    isSubmitting:
      createPatient.isPending || updatePatient.isPending,
  };
}
