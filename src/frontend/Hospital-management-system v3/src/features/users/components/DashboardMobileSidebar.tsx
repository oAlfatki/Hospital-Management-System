import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, HeartPulse } from 'lucide-react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button } from '@/src/core/components/ui/Button';
import { getSidebarItemsForRole } from '@/src/core/config/sidebar';

interface DashboardMobileSidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

export const DashboardMobileSidebar: React.FC<DashboardMobileSidebarProps> = ({
  mobileMenuOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!mobileMenuOpen) return null;

  const userRole = user?.role || 'Guest';
  const sidebarItems = getSidebarItemsForRole(userRole);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 max-w-xs w-full bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 flex flex-col z-10">
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-base">
              {t('hmsTitle')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey as any) || item.id;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
