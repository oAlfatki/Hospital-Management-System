import React, { useState } from 'react';
import { Plus, Building, Mail, Phone, Edit2 } from 'lucide-react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button } from '@/src/core/components/ui/Button';
import { Badge } from '@/src/core/components/ui/Badge';
import { PageHeader } from '@/src/core/components/ui/PageHeader';
import { LoadingState } from '@/src/core/components/ui/LoadingState';
import { ErrorState } from '@/src/core/components/ui/ErrorState';
import { formatDate } from '@/src/core/utils/cn';
import { useDoctors } from '../hooks/useDoctors';
import { useDepartments } from '../hooks/useDepartments';
import { useDoctorDialog } from '../hooks/useDoctorDialog';
import { useDoctorForm } from '../hooks/useDoctorForm';
import { useDepartmentForm } from '../hooks/useDepartmentForm';
import { useUpdateDoctor } from '../hooks/useUpdateDoctor';
import { DoctorDialog } from '../components/DoctorDialog';
import { DepartmentDialog } from '../components/DepartmentDialog';
import type { Doctor } from '../types/Doctor';

export const DoctorsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const { data: doctors = [], isLoading: isDocsLoading, error: docsError } = useDoctors();
  const { data: departments = [], isLoading: isDeptsLoading, error: deptsError } = useDepartments();

  const updateDoctorMutation = useUpdateDoctor();
  const dialog = useDoctorDialog();

  const doctorForm = useDoctorForm({
    mode: dialog.mode,
    selectedDoctor: dialog.selectedDoctor,
    onSuccess: dialog.closeDoctorDialog,
  });

  const departmentForm = useDepartmentForm({
    onSuccess: dialog.closeDepartmentDialog,
  });

  const [activeTab, setActiveTab] = useState<'doctors' | 'departments'>('doctors');

  if (isDocsLoading || isDeptsLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (docsError || deptsError) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  const toggleDoctorStatus = async (doctor: Doctor) => {
    if (!user) return;
    const newStatus = doctor.status === 'Active' ? 'Inactive' : 'Active';

    updateDoctorMutation.mutate({
      doctorId: doctor.doctorId,
      status: newStatus,
    });
  };

  const isManagementOrAdmin = user?.role === 'Admin' || user?.role === 'Management';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={t('doctorDeptMaster')}
        description={t('doctorDeptMasterDesc')}
      >
        {isManagementOrAdmin && (
          <div className="flex items-center gap-2">
            {activeTab === 'doctors' ? (
              <Button onClick={dialog.openCreateDoctor} className="gap-2 h-9 text-xs">
                <Plus className="h-4 w-4" />
                {t('addPhysician')}
              </Button>
            ) : (
              <Button onClick={dialog.openCreateDepartment} className="gap-2 h-9 text-xs">
                <Plus className="h-4 w-4" />
                {t('addDepartment')}
              </Button>
            )}
          </div>
        )}
      </PageHeader>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-150 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3.5 text-sm font-semibold transition-all relative px-2.5 cursor-pointer ${
            activeTab === 'doctors'
              ? 'text-emerald-500 font-bold border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          {t('physiciansDirectoryTab')} ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3.5 text-sm font-semibold transition-all relative px-2.5 cursor-pointer ${
            activeTab === 'departments'
              ? 'text-emerald-500 font-bold border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          {t('departmentsMasterTab')} ({departments.length})
        </button>
      </div>

      {/* ACTIVE VIEW TAB */}
      {activeTab === 'doctors' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {doctors.map((doc) => {
            const dept = departments.find((d) => d.departmentId === doc.departmentId);
            return (
              <div
                key={doc.doctorId}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl shadow-xs flex flex-col space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {doc.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{doc.name}</h3>
                      <p className="text-xs font-semibold text-emerald-500 mt-0.5">{doc.specialty}</p>
                      <p className="text-[10px] font-mono text-slate-400">{doc.doctorId}</p>
                    </div>
                  </div>
                  {isManagementOrAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dialog.openEditDoctor(doc)}
                      className="h-7 w-7 text-slate-400 hover:text-emerald-600"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-3 flex-1">
                  <p className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {t('departmentCol')}: <span className="font-semibold">{dept ? dept.name : t('vacant')}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {doc.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {doc.contactNumber || t('noContactProvided')}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-850">
                  <Badge variant={doc.status === 'Active' ? 'success' : 'neutral'}>
                    {doc.status === 'Active' ? t('commonActive') : t('commonInactive')}
                  </Badge>

                  {isManagementOrAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => toggleDoctorStatus(doc)}
                      className={`h-7 px-2.5 text-[10px] uppercase font-bold tracking-wider rounded ${
                        doc.status === 'Active'
                          ? 'text-rose-500 hover:bg-rose-50'
                          : 'text-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {doc.status === 'Active' ? t('deactivate') : t('activate')}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
                <th className="py-3.5 px-6">{t('colDepartmentID')}</th>
                <th className="py-3.5 px-6">{t('colDepartmentName')}</th>
                <th className="py-3.5 px-6">{t('colHeadOfDepartment')}</th>
                <th className="py-3.5 px-6">{t('colDescription')}</th>
                <th className="py-3.5 px-6">{t('colDateConfigured')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {departments.map((dept) => {
                const hod = doctors.find((d) => d.doctorId === dept.headOfDepartment);
                return (
                  <tr key={dept.departmentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">{dept.departmentId}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-100">{dept.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      {hod ? hod.name : t('vacant')}
                    </td>
                    <td className="py-4 px-6 text-slate-500 truncate max-w-sm">{dept.description || t('noDescriptionAdded')}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {formatDate(dept.createdOn, language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      <DoctorDialog
        mode={dialog.mode}
        isOpen={dialog.isDoctorOpen}
        selectedDoctor={dialog.selectedDoctor}
        departments={departments}
        form={doctorForm.form}
        onSubmit={doctorForm.onSubmit}
        isSubmitting={doctorForm.isSubmitting}
        onClose={dialog.closeDoctorDialog}
      />

      <DepartmentDialog
        isOpen={dialog.isDepartmentOpen}
        doctors={doctors}
        form={departmentForm.form}
        onSubmit={departmentForm.onSubmit}
        isSubmitting={departmentForm.isSubmitting}
        onClose={dialog.closeDepartmentDialog}
      />
    </div>
  );
};
