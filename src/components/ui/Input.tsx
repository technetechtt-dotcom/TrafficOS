import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
  { label, error, helperText, leftIcon, className = '', id, ...props },
  ref) =>
  {
    const inputId = id || Math.random().toString(36).substring(7);
    return (
      <div className="w-full">
        {label &&
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          
            {label}
          </label>
        }
        <div className="relative">
          {leftIcon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          }
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-xl border-gray-300 shadow-sm
              focus:ring-blue-500 focus:border-blue-500 sm:text-sm
              dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-500
              min-h-[44px] transition-colors
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              ${className}
            `}
            {...props} />
          
        </div>
        {error &&
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        }
        {helperText && !error &&
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        }
      </div>);

  }
);
Input.displayName = 'Input';