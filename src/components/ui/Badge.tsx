import React from 'react';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = ''
}: BadgeProps) {
  const variants = {
    success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      
      {icon}
      {children}
    </span>);

}