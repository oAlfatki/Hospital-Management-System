import React from 'react';
import toast from 'react-hot-toast';
import { Menu, Sun, Moon, Languages, LogOut, User as UserIcon } from 'lucide-react';
import { useLanguage, useTheme, useAuth } from '@/src/core/providers';
import { Button } from '@/src/core/components/ui/Button';

interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenMobileMenu }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          onClick={onOpenMobileMenu}
          className="md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-slate-800 dark:text-white text-base">
          {t('hmsTitle')}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 px-2.5 h-8"
        >
          <Languages className="h-4 w-4" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </Button>

        {/* User Badge & Logout */}
        {user && (
          <div className="flex items-center gap-3 border-s border-slate-200 dark:border-slate-800 ps-3 sm:ps-4">
            <div className="hidden sm:flex flex-col text-end">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {user.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { void logout().catch((error: Error) => toast.error(error.message)); }}
              title={t('logout') || 'Logout'}
              className="text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
