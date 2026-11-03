import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import { Button } from "./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
  size = "md",
}: DialogProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const maxWidth =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
        ? "max-w-4xl"
        : size === "xl"
          ? "max-w-6xl"
          : "max-w-2xl";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`
              relative
              z-10
              flex
              w-full
              max-h-[90vh]
              flex-col
              overflow-hidden

              ${maxWidth}

              rounded-[var(--radius-card)]
              border
              border-border

              bg-surface-card
              text-text

              shadow-card

              ${className}
            `}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <h2 className="text-xl font-semibold text-text">
                  {title}
                </h2>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-text-muted hover:bg-surface-muted hover:text-brand"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto bg-surface-card p-6">
              {children}
            </div>

            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-border bg-surface-muted px-6 py-5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};