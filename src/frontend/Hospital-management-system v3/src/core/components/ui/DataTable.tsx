import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface DataTableProps {
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
}

export function DataTable({
  children,
  pagination,
  className,
}: DataTableProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-(--radius-card) border border-border bg-surface-card shadow-card",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          {children}
        </table>
      </div>

      {pagination && (
        <div className="border-t border-border">
          {pagination}
        </div>
      )}
    </section>
  );
}