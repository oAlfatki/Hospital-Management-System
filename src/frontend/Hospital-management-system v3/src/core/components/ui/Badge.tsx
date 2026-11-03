import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const Badge = ({
  children,
  variant = 'neutral',
  className
} : BadgeProps) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-green-100 text-green-700 border border-transparent',
    warning: 'bg-amber-100 text-amber-700 border border-transparent',
    error: 'bg-red-100 text-red-700 border border-transparent',
    info: 'bg-teal-50 text-teal-700 border border-teal-150',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
