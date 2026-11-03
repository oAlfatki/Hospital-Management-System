import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay = ({
  isLoading,
  message = "Saving...",
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-(--radius-card) bg-white/70 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-14 w-14 animate-spin text-brand" />
        <p className="text-base font-medium text-text">
          {message}
        </p>
      </div>
    </div>
  );
};