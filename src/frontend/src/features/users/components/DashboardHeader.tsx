import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Button } from "../../../core/components/ui/Button";
import { useLanguage } from "../../../core/providers/LanguageProvider";
import {
  getSidebarItemsForRole,
  SIDEBAR_ITEMS,
} from "../../../core/config/sidebar";
import type { TranslationKey } from "../../../core/locales/i18n";

interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
}

export const DashboardHeader = ({
  onOpenMobileMenu,
}: DashboardHeaderProps) => {
  const { t, language, setLanguage } = useLanguage();

  const location = useLocation();

  const sidebarItems = getSidebarItemsForRole("Admin");

  const currentPath = location.pathname;

  const currentTab =
    SIDEBAR_ITEMS.find(
      (item) =>
        currentPath === item.path ||
        currentPath.startsWith(item.path + "/"),
    )?.id || "dashboard";

  const currentSidebarItem = sidebarItems.find(
    (item) => item.id === currentTab,
  );

  const user = {
    name: "Mohamed Ali Saleh",
    role: "Admin",
  };

  const timeStr = new Date().toLocaleTimeString();

  return (
    <header className="h-header bg-surface-card border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20">

      {/* Left */}
      <div className="flex items-center gap-4">

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden text-slate-500 hover:bg-surface-muted"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm">

          <span className="font-medium text-slate-400">
            System
          </span>

          <span className="text-slate-300">
            /
          </span>

          <span className="font-semibold text-slate-900 uppercase tracking-wide text-xs">
            {currentSidebarItem
              ? t(currentSidebarItem.labelKey as TranslationKey)
              : t("dashboard")}
          </span>

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-6 rtl:space-x-reverse">

        {/* Language */}
        <div className="flex items-center bg-surface-muted p-1 rounded-card border border-slate-200">

          <button
            onClick={() => setLanguage("en")}
            className={`text-xs px-2.5 py-1 rounded font-semibold transition-all duration-normal ${
              language === "en"
                ? "bg-surface-card text-slate-800 shadow-card"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage("ar")}
            className={`text-xs px-2.5 py-1 rounded font-semibold transition-all duration-normal ${
              language === "ar"
                ? "bg-brand-dark text-white shadow-card"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            AR
          </button>

        </div>

        {/* Clock */}

        <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">

          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

          <span className="text-tiny font-bold uppercase tracking-wider text-slate-500">
            Live
          </span>

          <span className="text-slate-300">
            |
          </span>

          <span className="text-xs text-slate-500 font-mono">
            {timeStr}
          </span>

        </div>

        {/* User */}

        <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">

          <div className="flex flex-col items-end rtl:items-start">

            <span className="text-xs font-semibold text-slate-900">
              {user.name}
            </span>

            <span className="text-[9px] font-bold bg-brand-soft text-brand-dark px-1.5 py-0.5 rounded uppercase tracking-widest">
              {user.role}
            </span>

          </div>

        </div>

        {/* Mobile */}

        <div className="md:hidden font-bold text-tiny uppercase tracking-wider px-2 py-1 rounded bg-surface-muted text-slate-700">

          {user.role}

        </div>

      </div>

    </header>
  );
};