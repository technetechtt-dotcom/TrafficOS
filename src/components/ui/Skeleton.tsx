import React from 'react';
interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'rectangle';
  className?: string;
}
export function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-800';
  const variants = {
    text: 'h-4 w-3/4 rounded',
    card: 'h-32 w-full rounded-2xl',
    circle: 'h-12 w-12 rounded-full',
    rectangle: 'h-full w-full rounded-xl'
  };
  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
}