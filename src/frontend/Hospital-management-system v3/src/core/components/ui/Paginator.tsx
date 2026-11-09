import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./Button";

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  isLoading: boolean;
  onClickPrev: () => void;
  onClickNext: () => void;
}

export function Paginator({
  page,
  pageCount,
  total,
  isLoading,
  onClickPrev,
  onClickNext,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-4">
      <p className="text-sm text-text-muted">
        Showing{" "}
        <span className="font-semibold text-text">
          {start}
        </span>{" "}
        –{" "}
        <span className="font-semibold text-text">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-text">
          {total}
        </span>{" "}
        patients
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous page"
          disabled={page === 1 || isLoading}
          onClick={onClickPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="mx-3 min-w-16 text-center text-sm font-medium text-text">
          {page} / {pageCount}
        </span>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Next page"
          disabled={page === pageCount || isLoading}
          onClick={onClickNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}