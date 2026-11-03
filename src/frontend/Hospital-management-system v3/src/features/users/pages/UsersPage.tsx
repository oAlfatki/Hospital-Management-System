import React from 'react';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button } from '@/src/core/components/ui/Button';
import { Badge } from '@/src/core/components/ui/Badge';
import { PageHeader } from '@/src/core/components/ui/PageHeader';
import { LoadingState } from '@/src/core/components/ui/LoadingState';
import { ErrorState } from '@/src/core/components/ui/ErrorState';
import { useUsers } from '../hooks/useUsers';
import { useUserDialog } from '../hooks/useUserDialog';
import { useUserForm } from '../hooks/useUserForm';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { UserDialog } from '../components/UserDialog';
import type { User } from '../types/User';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();

  const { data: users = [], isLoading, error } = useUsers();
  const updateUserMutation = useUpdateUser();
  const dialog = useUserDialog();

  const userForm = useUserForm({
    mode: dialog.mode,
    selectedUser: dialog.selectedUser,
    onSuccess: dialog.closeDialog,
  });

  const toggleUserStatus = (user: User) => {
    if (!currentUser) return;
    if (user.userId === currentUser.userId) return;

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateUserMutation.mutate({
      userId: user.userId,
      status: newStatus,
    });
  };

  // RBAC Shield Screen
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center max-w-xl mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl rounded-xl mt-12">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
          <ShieldAlert className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('adminRbacGatekeeperShield')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('staffDirectoryRestricted')}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (error) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('staffAccountConfigurations')}
        description={t('staffAccountDesc')}
      >
        <Button onClick={dialog.openCreateDialog} className="gap-2 h-9 text-xs">
          <UserPlus className="h-4 w-4" />
          {t('addStaffAccount')}
        </Button>
      </PageHeader>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        <table className="w-full text-start text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
              <th className="py-3.5 px-6">{t('colUserID')}</th>
              <th className="py-3.5 px-6">{t('fullName')}</th>
              <th className="py-3.5 px-6">{t('colEmailAddress')}</th>
              <th className="py-3.5 px-6">{t('role')}</th>
              <th className="py-3.5 px-6">{t('colContactNumber')}</th>
              <th className="py-3.5 px-6">{t('commonStatus')}</th>
              <th className="py-3.5 px-6 text-center">{t('colToggleStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  {t('noUserAccountsFound')}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">{u.userId}</td>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                  <td className="py-4 px-6 font-medium">{u.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {u.role === 'Admin' ? (language === 'ar' ? 'مدير' : 'Admin') :
                       u.role === 'Doctor' ? (language === 'ar' ? 'طبيب' : 'Doctor') :
                       u.role === 'Nurse' ? (language === 'ar' ? 'ممرض' : 'Nurse') :
                       u.role === 'Accounts' ? (language === 'ar' ? 'حسابات' : 'Accounts') :
                       u.role === 'Management' ? (language === 'ar' ? 'إدارة' : 'Management') : u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{u.contactNumber || '—'}</td>
                  <td className="py-4 px-6">
                    <Badge variant={u.status === 'Active' ? 'success' : 'neutral'}>
                      {u.status === 'Active' ? t('commonActive') : t('commonInactive')}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => toggleUserStatus(u)}
                      disabled={u.userId === currentUser?.userId}
                      className={`h-8 px-3.5 text-xs font-bold tracking-wider rounded ${
                        u.status === 'Active' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'Active' ? t('deactivate') : t('activate')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <UserDialog
        mode={dialog.mode}
        isOpen={dialog.isOpen}
        selectedUser={dialog.selectedUser}
        form={userForm.form}
        onSubmit={userForm.onSubmit}
        isSubmitting={userForm.isSubmitting}
        onClose={dialog.closeDialog}
      />
    </div>
  );
};
