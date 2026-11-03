import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export const FilterBar = ({
  children,
  className,
}: FilterBarProps) => {
  return (
    <section
      className={cn(
        "rounded-(--radius-card) border border-border bg-surface-card p-5 shadow-card",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {children}
      </div>
    </section>
  );
};