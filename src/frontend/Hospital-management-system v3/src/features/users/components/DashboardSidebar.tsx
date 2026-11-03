import React from 'react';
import { NavLink } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { getSidebarItemsForRole } from '@/src/core/config/sidebar';

export const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const userRole = user?.role || 'Guest';
  const sidebarItems = getSidebarItemsForRole(userRole);

  return (
    <aside className="hidden md:flex flex-col w-64 border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-xs">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white text-base block leading-none">
            {t('hmsTitle')}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
            v2.0 Architecture
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const label = t(item.labelKey as any) || item.id;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User info */}
      {user && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
              {user.name.slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
