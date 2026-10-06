import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
}
export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  colorClass = 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
}: StatCardProps) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 20
        },
        show: {
          opacity: 1,
          y: 0
        }
      }}
      className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h4>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
      </div>

      {trend !== undefined &&
      <div className="mt-4 flex items-center text-sm">
          <span
          className={`flex items-center font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          
            {trend >= 0 ?
          <TrendingDownIcon className="w-4 h-4 mr-1" /> :

          <TrendingUpIcon className="w-4 h-4 mr-1" />
          }
            {Math.abs(trend)}%
          </span>
          {trendLabel &&
        <span className="text-gray-500 dark:text-gray-400 ml-2">
              {trendLabel}
            </span>
        }
        </div>
      }
    </motion.div>);

}