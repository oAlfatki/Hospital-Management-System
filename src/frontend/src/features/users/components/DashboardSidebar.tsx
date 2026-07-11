import {
  ChevronLeft,
  ChevronRight,
  Globe,
  HeartPulse,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../core/components/ui/Button";
import {
  getSidebarItemsForRole,
  SIDEBAR_ITEMS,
} from "../../../core/config/sidebar";
import type { TranslationKey } from "../../../core/locales/i18n";
import { useLanguage } from "../../../core/providers/LanguageProvider";

export interface ISidebarProps {
  sidebarCollapsed: boolean;
}

export const DashboardSidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { t, language, setLanguage } = useLanguage();

  const sidebarItems = getSidebarItemsForRole("Admin");

  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const currentTab =
    SIDEBAR_ITEMS.find(
      (item) =>
        currentPath === item.path || currentPath.startsWith(item.path + "/"),
    )?.id || "dashboard";

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-normal relative z-30 ${
        sidebarCollapsed ? "w-sidebar-collapsed" : "w-sidebar"
      }`}
    >
      {/* Brand */}
      <div className="h-header flex items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="bg-brand text-white p-2 rounded flex items-center justify-center shrink-0 shadow-card">
          <HeartPulse className="h-5 w-5" />
        </div>

        {!sidebarCollapsed && (
          <span className="font-semibold tracking-tight text-white">
            {t("hospitalHMS")}
          </span>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`absolute top-4 bg-sidebar-border border border-sidebar-hover rounded-full h-6 w-6 flex items-center justify-center shadow-card hover:bg-sidebar-hover text-teal-100 cursor-pointer z-50 ${
          language === "ar" ? "-left-3" : "-right-3"
        }`}
      >
        {sidebarCollapsed ? (
          language === "ar" ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )
        ) : language === "ar" ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="text-tiny uppercase tracking-widest text-teal-400/85 font-bold mb-3 px-2">
            {t("systemModules")}
          </div>
        )}

        {sidebarItems.map((item) => {
          const Icon = item.icon;

          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-card text-sm font-medium transition-all duration-normal group relative cursor-pointer border ${
                isActive
                  ? "bg-brand/15 text-teal-300 border-brand/20 shadow-inner"
                  : "text-teal-100/60 hover:bg-sidebar-border/65 hover:text-white border-transparent"
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 flex-shrink-0 ${
                  isActive
                    ? "text-brand"
                    : "text-teal-100/50 group-hover:text-teal-100"
                }`}
              />

              {!sidebarCollapsed && (
                <span>{t(item.labelKey as TranslationKey)}</span>
              )}

              {sidebarCollapsed && (
                <div
                  className={`absolute bg-sidebar text-white text-xs px-2.5 py-1.5 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none font-medium shadow-card z-50 whitespace-nowrap border border-sidebar-border ${
                    language === "ar" ? "right-16" : "left-16"
                  }`}
                >
                  {t(item.labelKey as TranslationKey)}
                </div>
              )}
            </button>
          );
        })}
      </nav>





      {/* Language Selection Quick Bar for Sidebar */}
            {/* Language Selection */}
      {!sidebarCollapsed && (
        <div className="px-6 py-3 border-t border-sidebar-border/60 flex items-center justify-between">
          <span className="text-tiny text-teal-300/60 font-semibold flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-brand" />
            {t("changeLanguage")}
          </span>

          <div className="flex gap-1 bg-sidebar-border/45 p-0.5 rounded-card border border-sidebar-border/60">
            <button
              onClick={() => setLanguage("en")}
              className={`text-tiny px-2 py-1 rounded font-bold transition-all duration-normal ${
                language === "en"
                  ? "bg-brand text-white shadow-card"
                  : "text-teal-100/60 hover:text-teal-100"
              }`}
            >
              EN
            </button>

            <button
              onClick={() => setLanguage("ar")}
              className={`text-tiny px-2 py-1 rounded font-bold transition-all duration-normal ${
                language === "ar"
                  ? "bg-brand text-white shadow-card"
                  : "text-teal-100/60 hover:text-teal-100"
              }`}
            >
              عربي
            </button>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 bg-sidebar-border/30 rounded-card border border-sidebar-border/50">
          <div className="h-8 w-8 rounded bg-brand-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
            {"Mohamed Ali Saleh"
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white text-left">
                Mohamed Ali Saleh
              </p>

              <p className="text-tiny text-teal-300/70 truncate font-medium text-left">
                Admin
              </p>
            </div>
          )}

          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-teal-200/50 hover:text-rose-400 hover:bg-rose-500/10 p-0 h-8 w-8"
              title={t("logout")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sidebarCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 mt-2 text-teal-200/50 hover:text-rose-400"
            title={t("logout")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
