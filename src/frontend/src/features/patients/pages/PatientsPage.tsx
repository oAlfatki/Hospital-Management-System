import { useState } from "react";
import { Plus } from "lucide-react";
import { RegisterPatientSchema as PatientSchema } from "../validation/RegisterPatientSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import type { IPatientFormInput } from "../types/IRegisterPatientFormInput";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "../../../core/components/ui/Button";
import { useLanguage } from "../../../core/providers/LanguageProvider";
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
import { LoadingState } from "../../../core/components/ui/LoadingState";
import { ErrorState } from "../../../core/components/ui/ErrorState";
import { appConfig } from "../../../core/config/app";
import { PageHeader } from "../../../core/components/ui/PageHeader";
import { FilterBar } from "../../../core/components/ui/FilterBar";
import { SearchInput } from "../../../core/components/ui/SearchInput";
import { PatientStatusFilter } from "../components/PatientStatusFilter";
import { PatientTable } from "../components/PatientTable";
import { usePatientFilters } from "../hooks/usePatientFilters";
import { usePatientPagination } from "../hooks/usePatientPagination";
import { usePatientDialog } from "../hooks/usePatientDialog";
import { usePatientForm } from "../hooks/usePatientForm";

export const PatientsPage = () => {
  const { t } = useLanguage();

  // Filter patients by search and status

  // Dialog states
  const dialog = usePatientDialog();

  const pagination = usePatientPagination();

  const { data, isLoading, error } = usePatients(
    pagination.page,
    pagination.pageSize,
  );
  const {
    pageNumber,
    totalPages,
    totalCount,
    items: patients = [],
  } = data ?? {};

  const filters = usePatientFilters(patients);

  const patientForm = usePatientForm({
    mode: dialog.mode,
    selectedPatient: dialog.selectedPatient,
    page: pagination.page,
    pageSize: pagination.pageSize,
    onSuccess: dialog.closeDialog,
  });

  if (isLoading) {
    return <LoadingState message={t("commonLoading")} />;
  }

  if (error) {
    return <ErrorState message={t("commonSomethingWentWrong")} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <PageHeader
        title={t("patientDirectory")}
        description={t("patientDirectoryDesc")}
      >
        <Button
          onClick={dialog.openRegisterDialog}
          className="h-10 gap-2 px-5 bg-brand hover:bg-brand-dark text-white shadow-card transition-all duration-normal"
        >
          <Plus className="h-4 w-4" />
          {t("registerPatient")}
        </Button>
      </PageHeader>

      {/* Directory Search & Filter Controls */}

      <FilterBar>
        <SearchInput
          value={filters.searchTerm}
          onChange={filters.setSearchTerm}
          placeholder={t("searchPatientsPlaceholder")}
        />
        <PatientStatusFilter
          value={filters.statusFilter}
          onChange={filters.setStatusFilter}
        />
      </FilterBar>

      {/* Directory Listing Table */}
      {
        <PatientTable
          patients={filters.filteredPatients}
          onEdit={dialog.openEditDialog}
          pagination={
            <Paginator
              page={pageNumber ?? 1}
              pageCount={totalPages ?? 1}
              total={totalCount ?? 1}
              isLoading={isLoading}
              onClickPrev={pagination.onClickPrev}
              onClickNext={pagination.onClickNext}
            />
          }
        />
      }

      <PatientDialog
        mode={dialog.mode}
        isOpen={
          dialog.mode === "create" ? dialog.isRegisterOpen : dialog.isEditOpen
        }
        form={patientForm.form}
        onSubmit={patientForm.onSubmit}
        isSubmitting={patientForm.isSubmitting}
        onClose={dialog.closeDialog}
      />
    </div>
  );
};
