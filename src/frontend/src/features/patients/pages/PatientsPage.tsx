import React, { useState } from "react";
import { Plus, Search, Edit3, Filter } from "lucide-react";
import { RegisterPatientSchema as PatientSchema } from "../validation/RegisterPatientSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import type { IPatientFormInput } from "../types/IRegisterPatientFormInput";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "../../../core/components/ui/Button";
import { Badge } from "../../../core/components/ui/Badge";
import { useLanguage } from "../../../core/providers/LanguageProvider";
import { calculateAge, formatDate } from "../../../core/utils/cn";
import type { Patient } from "../types/Patient";
import { usePatients } from "../hooks/usePatients";
import { useCreatePatient } from "../hooks/useCreatePatient";
import toast from "react-hot-toast";
import { Paginator } from "../../../core/components/ui/Paginator";
import { useUpdatePatient } from "../hooks/useUpdatePatient";
import { PatientMapper } from "../mappers/patientMapper";
import { PatientDialog } from "../components/PatientDialog";
import { useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "../../../core/types/PaginatedResponse";
type PatientStatusType = "Active" | "Inactive" | "Deceased";

export const PatientsPage = () => {
  const { t, language } = useLanguage();

  // Filter patients by search and status
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PatientStatusType>(
    "All",
  );

  // Dialog states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data, isLoading, error } = usePatients(page, pageSize);
  const { pageNumber, totalPages, totalCount, items: patients } = data ?? {};

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const queryClient = useQueryClient();

  const form = useForm<IPatientFormInput>({
    resolver: yupResolver(PatientSchema),
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

  const openRegisterDialog = () => {
    setMode("create");
    setSelectedPatient(null);

    resetForm();

    setIsRegisterOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setMode("edit");
    setSelectedPatient(patient);

    setPatientDataToForm(patient);

    setIsEditOpen(true);
  };

  const setPatientDataToForm = (patient: Patient) => {
    reset({
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      email: patient.email,
      medicalHistory: patient.medicalHistory,
      address: patient.address,
      status: patient.status,
    });
  };

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

  const filteredPatients = patients?.filter((p: Patient) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const onRegisterSubmit = async (data: IPatientFormInput) => {
    const createPatientRequest = PatientMapper.toCreateRequest(data);
    await createPatient.mutate(createPatientRequest, {
      onSuccess(patient) {
        console.log("The patient is: ");
        toast.success(`${t("toastPatientRegistered")}`);
        console.log(patient);
      },
      onError(error) {
        console.log(`on error: ${error.message}`);
        console.log(`error.isValidationError: ${error.isValidationError}`);
        if (error.isValidationError && error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, messages]) => {
            console.log(`Validation error on field ${field}: ${messages[0]}`);
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
  };

  const onEditSubmit = async (data: IPatientFormInput) => {
    console.log(`patientId : ${selectedPatient?.patientId}`);

    const updatePatientRequest = PatientMapper.toUpdateRequest(
      selectedPatient?.patientId || "",
      data,
    );

    await updatePatient.mutate(updatePatientRequest, {
      onSuccess() {
        console.log("The patient is: ");
        toast.success(`${t("toastPatientUpdated")}`);

        const updatedPatient: Patient = {
          ...selectedPatient!,
          ...data,
        };

        queryClient.setQueryData(
          [`patients-list-page-${page}-${pageSize}`],
          (oldData: Paginated<Patient> | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              items: oldData.items.map((patient) =>
                patient.patientId === updatedPatient.patientId
                  ? updatedPatient
                  : patient,
              ),
            };
          },
        );
      },
      onError(error) {
        console.log(`on error: ${error.message}`);
        console.log(`error.isValidationError: ${error.isValidationError}`);
        if (error.isValidationError && error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, messages]) => {
            console.log(`Validation error on field ${field}: ${messages[0]}`);
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

    //updatePatient.mutate);
    console.log(data);
  };

  const onSubmit: SubmitHandler<IPatientFormInput> = async (data) => {
    if (mode === "create") {
      await onRegisterSubmit(data);
    } else {
      await onEditSubmit(data);
    }
  };

  // Handlers
  const onClickPrev = () => {
    setPage((prev) => prev - 1);
  };
  const onClickNext = () => {
    setPage((prev) => prev + 1);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading patients.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            {t("patientDirectory")}
          </h1>

          <p className="mt-1 text-sm text-sidebar-border">
            {t("patientDirectoryDesc")}
          </p>
        </div>

        <Button
          onClick={openRegisterDialog}
          className="h-10 gap-2 px-5 bg-brand hover:bg-brand-dark text-white shadow-card transition-all duration-normal"
        >
          <Plus className="h-4 w-4" />
          {t("registerPatient")}
        </Button>
      </div>

      {/* Directory Search & Filter Controls */}
      <div className="rounded-(--radius-card) bg-surface-card border border-border shadow-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />

            <input
              type="text"
              placeholder={t("searchPatientsPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
w-full
rounded-md
border
border-border
bg-surface-card
py-2.5
pl-10
pr-4
text-sm
text-text
outline-none
transition-all
duration-normal
placeholder:text-text-light
focus:border-brand
focus:ring-2
focus:ring-brand/15
"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-text-light" />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PatientStatusType | "All")
              }
              className="
w-52
rounded-md
border
border-border
bg-surface-card
px-3
py-2.5
text-sm
text-text
outline-none
transition-all
duration-normal
focus:border-brand
focus:ring-2
focus:ring-brand/15
"
            >
              <option value="All">{t("commonAllStatuses")}</option>
              <option value="Active">{t("commonActive")}</option>
              <option value="Inactive">{t("commonInactive")}</option>
              <option value="Deceased">{t("commonDeceased")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Listing Table */}
      <div className="overflow-hidden rounded-(--radius-card) border border-border bg-surface-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-tiny font-bold uppercase tracking-wider text-text-muted">
                <th className="px-6 py-4">
                  {language === "ar" ? "معرف المريض" : "Patient ID"}
                </th>

                <th className="px-6 py-4">{t("fullName")}</th>

                <th className="px-6 py-4">{t("colDateOfBirthAge")}</th>

                <th className="px-6 py-4">{t("colGender")}</th>

                <th className="px-6 py-4">{t("colContactNumber")}</th>

                <th className="px-6 py-4">{t("colEmailAddress")}</th>

                <th className="px-6 py-4">{t("commonStatus")}</th>

                <th className="px-6 py-4 text-center">{t("colActions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredPatients?.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-sidebar-border"
                  >
                    {isLoading
                      ? t("refreshingPatientDirectory")
                      : t("noPatientRecordsFound")}
                  </td>
                </tr>
              ) : (
                filteredPatients?.map((patient: Patient) => {
                  const calculatedAge = calculateAge(patient.dateOfBirth);

                  return (
                    <tr
                      key={patient.patientId}
                      className="transition-colors duration-normal hover:bg-surface-muted"
                    >
                      <td className="px-6 py-5 font-mono text-xs font-bold uppercase text-brand">
                        {patient.patientId}
                      </td>

                      <td className="px-6 py-5 font-semibold text-text">
                        {patient.name}
                      </td>

                      <td className="px-6 py-5 text-text-muted">
                        {formatDate(
                          patient.dateOfBirth,
                          language === "ar" ? "ar-EG" : "en-US",
                        )}

                        <span className="ml-2 text-xs text-text-light">
                          ({calculatedAge} {t("commonYears")})
                        </span>
                      </td>

                      <td className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-600">
                        {patient.gender === "Male"
                          ? t("commonMale")
                          : patient.gender === "Female"
                            ? t("commonFemale")
                            : patient.gender === "Other"
                              ? t("commonOther")
                              : patient.gender === "Prefer not to say"
                                ? t("commonPreferNotToSay")
                                : patient.gender}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {patient.contactNumber}
                      </td>

                      <td className="max-w-55 truncate px-6 py-5 text-slate-600">
                        {patient.email || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <Badge
                          variant={
                            patient.status === "Active"
                              ? "success"
                              : patient.status === "Inactive"
                                ? "warning"
                                : "error"
                          }
                        >
                          {patient.status === "Active"
                            ? t("commonActive")
                            : patient.status === "Inactive"
                              ? t("commonInactive")
                              : t("commonDeceased")}
                        </Badge>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(patient)}
                            className="
                        h-9
                        w-9
                        rounded-lg
                        text-brand-dark
                        transition-all
                        duration-normal
                        hover:bg-brand-soft
                        hover:text-brand
                      "
                            title={t("commonEdit")}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <Paginator
          page={pageNumber ?? 1}
          pageCount={totalPages ?? 1}
          total={totalCount ?? 1}
          isLoading={isLoading}
          onClickPrev={onClickPrev}
          onClickNext={onClickNext}
        />
      </div>

      <PatientDialog
        mode={mode}
        isOpen={mode === "create" ? isRegisterOpen : isEditOpen}
        onClose={() => {
          if (mode === "create") {
            setIsRegisterOpen(false);
          } else {
            setIsEditOpen(false);
          }
        }}
        form={form}
        onSubmit={onSubmit}
      />
    </div>
  );
};
