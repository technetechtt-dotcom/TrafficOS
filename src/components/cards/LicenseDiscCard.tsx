import React from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  CalendarIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  ClockIcon,
  FileTextIcon } from
'lucide-react';
import { getDiscStatus, daysUntilExpiry } from '../../utils/license';
import { formatDate } from '../../utils/formatters';
interface LicenseDiscCardProps {
  vehicle: Vehicle;
  onRenew: (vehicle: Vehicle) => void;
  onViewHistory?: (vehicle: Vehicle) => void;
}
export function LicenseDiscCard({
  vehicle,
  onRenew,
  onViewHistory
}: LicenseDiscCardProps) {
  const status = getDiscStatus(vehicle.licenseDiscExpiry);
  const days = daysUntilExpiry(vehicle.licenseDiscExpiry);
  const statusConfig = {
    valid: {
      label: 'Valid',
      badge: 'success' as const,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      accent: 'bg-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      message: `Expires in ${days} days`
    },
    expiring: {
      label: 'Expiring Soon',
      badge: 'warning' as const,
      icon: <ClockIcon className="w-5 h-5" />,
      accent: 'bg-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      message: `Renew within ${days} days to avoid penalties`
    },
    expired: {
      label: 'Expired',
      badge: 'danger' as const,
      icon: <AlertTriangleIcon className="w-5 h-5" />,
      accent: 'bg-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      message: `Expired ${Math.abs(days)} days ago — arrears apply`
    }
  };
  const config = statusConfig[status];
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 10
        },
        show: {
          opacity: 1,
          y: 0
        }
      }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      
      {/* Status accent strip */}
      <div className={`h-1 ${config.accent}`} />

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl ${config.bg} ${config.text} flex items-center justify-center`}>
              
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {vehicle.licensePlate}
                </h3>
                <Badge variant={config.badge} size="sm">
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${config.bg} ${config.text} rounded-xl p-3 mb-4 text-sm font-medium flex items-center gap-2`}>
          
          <CalendarIcon className="w-4 h-4 flex-shrink-0" />
          <span>{config.message}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 pt-1">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              Expiry Date
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {vehicle.licenseDiscExpiry ?
              formatDate(vehicle.licenseDiscExpiry) :
              '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              Tare Weight
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {vehicle.tareWeight ? `${vehicle.tareWeight} kg` : '—'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          {onViewHistory &&
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FileTextIcon className="w-4 h-4" />}
            onClick={() => onViewHistory(vehicle)}>
            
              History
            </Button>
          }
          <Button
            variant={status === 'valid' ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={<RefreshCwIcon className="w-4 h-4" />}
            onClick={() => onRenew(vehicle)}
            className="flex-1 ml-auto">
            
            {status === 'expired' ? 'Renew Now (Arrears)' : 'Renew License'}
          </Button>
        </div>
      </div>
    </motion.div>);

}