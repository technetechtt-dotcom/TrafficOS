import React from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../../types';
import { Badge } from '../ui/Badge';
import { getDiscStatus, daysUntilExpiry } from '../../utils/license';
import {
  CarIcon,
  EditIcon,
  TrashIcon,
  HashIcon,
  FileTextIcon,
  ChevronRightIcon } from
'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  fineCount?: number;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onViewFines?: (vehicle: Vehicle) => void;
  onViewDetail?: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  fineCount = 0,
  onEdit,
  onDelete,
  onViewFines,
  onViewDetail
}: VehicleCardProps) {
  const discStatus = getDiscStatus(vehicle.licenseDiscExpiry);
  const discDays = daysUntilExpiry(vehicle.licenseDiscExpiry);

  const discBadge = {
    valid: {
      variant: 'success' as const,
      label: 'Disc valid'
    },
    expiring: {
      variant: 'warning' as const,
      label: `Disc expires in ${discDays}d`
    },
    expired: {
      variant: 'danger' as const,
      label: 'Disc expired'
    }
  }[discStatus];

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          scale: 0.97
        },
        show: {
          opacity: 1,
          scale: 1
        }
      }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group">
      
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <CarIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <button
                onClick={() => onViewDetail?.(vehicle)}
                disabled={!onViewDetail}
                className="text-xl font-bold text-gray-900 dark:text-white tracking-tight text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:hover:text-gray-900 dark:disabled:hover:text-white disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded truncate block">
                
                {vehicle.licensePlate}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
            <button
              onClick={() => onViewFines?.(vehicle)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              aria-label={`View fines for ${vehicle.licensePlate}`}
              title="View fines">
              
              <FileTextIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit?.(vehicle)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              aria-label={`Edit ${vehicle.licensePlate}`}
              title="Edit vehicle">
              
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(vehicle)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label={`Remove ${vehicle.licensePlate}`}
              title="Remove vehicle">
              
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant={discBadge.variant} size="sm">
            {discBadge.label}
          </Badge>
          {fineCount > 0 ?
          <Badge variant="warning" size="sm">
              {fineCount} outstanding {fineCount === 1 ? 'fine' : 'fines'}
            </Badge> :

          <Badge variant="success" size="sm">
              No outstanding fines
            </Badge>
          }
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <HashIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-mono text-xs truncate">{vehicle.vin}</span>
        </div>
      </div>

      {onViewDetail &&
      <button
        onClick={() => onViewDetail(vehicle)}
        className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        
          View vehicle
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      }
    </motion.div>);

}