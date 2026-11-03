import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  helperText,
  id,
  type = 'text',
  ...props
}) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={cn(
          'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-md outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">{helperText}</p>
      ) : null}
    </div>
  );
};
