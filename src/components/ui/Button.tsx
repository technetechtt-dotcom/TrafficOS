import React from 'react';
import { LoaderIcon } from 'lucide-react';
import { motion } from 'framer-motion';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  const variants = {
    primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700',
    ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
    danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm'
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-6 text-base min-w-[44px]',
    lg: 'h-14 px-8 text-lg min-w-[44px]'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <motion.button
      whileTap={{
        scale: disabled || isLoading ? 1 : 0.98
      }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}>
      
      {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>);

}