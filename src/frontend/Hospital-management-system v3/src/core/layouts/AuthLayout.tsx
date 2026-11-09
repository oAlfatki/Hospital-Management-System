
import { HeartPulse, Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../providers/LanguageProvider';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';


export const AuthLayout = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-200">
      
      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </Button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 mb-4 flex items-center justify-center">
          <HeartPulse className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
          {t('hmsTitle')}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
          {t('secureStaffPortalLogin')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 border border-slate-100 dark:border-slate-850 sm:rounded-xl sm:px-10 shadow-xl dark:shadow-slate-950/25">
          <Outlet />
        </div>
        
        {/* Humble and helpful hint for log-ins */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
            {t('staffPortalHint')}
          </p>
        </div>
      </div>
    </div>
  );
};
