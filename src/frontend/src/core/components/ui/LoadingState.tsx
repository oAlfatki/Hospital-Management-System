import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "Loading...",
}: LoadingStateProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-14 w-14 animate-spin text-brand" />
        <p className="text-base font-medium text-text-muted">
          {message}
        </p>
      </div>
    </div>
  );
};