import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { DashboardHeader } from "../../features/users/components/DashboardHeader";
import { DashboardMobileSidebar } from "../../features/users/components/DashboardMobileSidebar";
import { DashboardSidebar } from "../../features/users/components/DashboardSidebar";
import { useLanguage } from "../providers/LanguageProvider";

export const DashboardLayout: React.FC = () => {
  const { language } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const locale = language === "ar" ? "ar-EG" : "en-US";

      const timePart = now.toLocaleTimeString(locale, {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      });

      const datePart = now.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setTimeStr(`${timePart} • ${datePart}`);
    };

    updateClock();

    const interval = setInterval(updateClock, 30000);

    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page text-slate-900 font-sans">
      <DashboardSidebar />

      <DashboardMobileSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-surface-page">
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-page">
          <div className="mx-auto max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};