import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export const PageHeader = ({
  title,
  description,
  children,
}: PageHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-sidebar-border">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      )}
    </header>
  );
};