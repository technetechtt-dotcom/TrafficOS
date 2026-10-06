import React from 'react';
import { Button } from './Button';
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction &&
      <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      }
    </div>);

}