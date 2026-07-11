import {
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Languages,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../core/components/ui/Button";
import { useLanguage } from "../../../core/providers/LanguageProvider";
import {
  getSidebarItemsForRole,
  SIDEBAR_ITEMS,
} from "../../../core/config/sidebar";
import type { TranslationKey } from "../../../core/locales/i18n";

interface DashboardMobileSidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

export const DashboardMobileSidebar = ({
  mobileMenuOpen,
  onClose,
}: DashboardMobileSidebarProps) => {
  const { t, language, setLanguage } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems = getSidebarItemsForRole("Admin");

  const currentPath = location.pathname;

  const currentTab =
    SIDEBAR_ITEMS.find(
      (item) =>
        currentPath === item.path || currentPath.startsWith(item.path + "/"),
    )?.id || "dashboard";

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage);
    onClose();
  };

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-overlay transition-opacity duration-normal ${
          mobileMenuOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 bg-sidebar z-modal transform transition-transform duration-normal ease-in-out flex flex-col border-r border-sidebar-border w-sidebar ${
          language === "ar" ? "right-0" : "left-0"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : language === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-header flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="bg-brand text-white p-2 rounded shadow-card">
              <HeartPulse className="h-5 w-5" />
            </div>

            <span className="font-semibold tracking-tight text-white">
              {t("hospitalHMS")}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-teal-200/50"
          >
            {language === "ar" ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-all duration-normal cursor-pointer border ${
                  isActive
                    ? "bg-brand/15 text-teal-300 border-brand/20"
                    : "text-teal-100/60 hover:bg-sidebar-border/65 hover:text-white border-transparent"
                }`}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive
                      ? "text-brand"
                      : "text-teal-100/50"
                  }`}
                />

                <span>{t(item.labelKey as TranslationKey)}</span>
              </button>
            );
          })}
        </nav>



        {/* Language Selection */}
        {/* Language Selection */}
        <div className="px-6 py-4 border-t border-sidebar-border bg-sidebar-footer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-teal-300 font-semibold flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-brand" />
              {t("changeLanguage")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`py-1.5 text-xs rounded-card font-bold transition-all duration-normal border ${
                language === "en"
                  ? "bg-brand border-brand text-white"
                  : "bg-sidebar-border/40 border-transparent text-teal-200 hover:bg-sidebar-border"
              }`}
            >
              English
            </button>

            <button
              onClick={() => handleLanguageChange("ar")}
              className={`py-1.5 text-xs rounded-card font-bold transition-all duration-normal border ${
                language === "ar"
                  ? "bg-brand border-brand text-white"
                  : "bg-sidebar-border/40 border-transparent text-teal-200 hover:bg-sidebar-border"
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border flex items-center gap-3 bg-sidebar-card">
          <div className="h-8 w-8 rounded bg-brand-dark text-white flex items-center justify-center font-bold text-xs">
            {"Mohamed Ali Saleh"
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white text-left">
              Mohamed Ali Saleh
            </p>

            <p className="text-tiny text-teal-300/70 truncate font-medium text-left">
              Admin
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-teal-200/50 hover:text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </>
  );
};
