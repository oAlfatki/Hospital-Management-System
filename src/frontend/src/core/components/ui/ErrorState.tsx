import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
}

export const ErrorState = ({
  message = "Something went wrong.",
}: ErrorStateProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-14 w-14 text-error" />
        <p className="text-base font-medium text-error">
          {message}
        </p>
      </div>
    </div>
  );
};