import React from 'react';
import { motion } from 'framer-motion';
import { Fine } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateFineFees, daysUntil } from '../../utils/payments';
import { pointsForOffence } from '../../utils/demerits';
import {
  SparklesIcon,
  ScaleIcon,
  CreditCardIcon,
  MapPinIcon,
  ClockIcon,
  ShieldIcon,
  TagIcon,
  ReceiptIcon,
  ChevronRightIcon,
  GaugeIcon } from
'lucide-react';

interface FineCardProps {
  fine: Fine;
  onAnalyze?: (fine: Fine) => void;
  onDispute?: (fine: Fine) => void;
  onPay?: (fine: Fine) => void;
  onViewDetail?: (fine: Fine) => void;
  onViewReceipt?: (fine: Fine) => void;
}

export function FineCard({
  fine,
  onAnalyze,
  onDispute,
  onPay,
  onViewDetail,
  onViewReceipt
}: FineCardProps) {
  const fees = calculateFineFees(fine);
  const points = pointsForOffence(fine.offenceType);
  const dueIn = daysUntil(fine.dueDate);
  const isOpen = fine.status === 'pending' || fine.status === 'overdue';

  const getStatusBadge = (status: Fine['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="danger">Overdue</Badge>;
      case 'disputed':
        return <Badge variant="info">Disputed</Badge>;
      case 'dismissed':
        return <Badge variant="neutral">Dismissed</Badge>;
    }
  };

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
      
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <button
                onClick={() => onViewDetail?.(fine)}
                disabled={!onViewDetail}
                className="text-lg font-semibold text-gray-900 dark:text-white text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:hover:text-gray-900 dark:disabled:hover:text-white disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                
                {fine.offenceType}
              </button>
              {getStatusBadge(fine.status)}
              {points > 0 && isOpen &&
              <Badge
                variant="neutral"
                size="sm"
                icon={<GaugeIcon className="w-3 h-3" />}>
                
                  {points} pt{points === 1 ? '' : 's'}
                </Badge>
              }
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {fine.offenceDescription}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(fine.amount)}
            </span>
            {isOpen &&
            <p
              className={`text-xs font-medium mt-0.5 ${dueIn < 0 ? 'text-red-600 dark:text-red-400' : dueIn <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
              
                {dueIn < 0 ? `${Math.abs(dueIn)}d overdue` : `Due in ${dueIn}d`}
              </p>
            }
          </div>
        </div>

        {isOpen && fees.isDiscountEligible &&
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <TagIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Pay {formatCurrency(fees.total)} now and save{' '}
              <strong>{formatCurrency(fees.discount)}</strong> —{' '}
              {fees.daysRemaining} {fees.daysRemaining === 1 ? 'day' : 'days'}{' '}
              left in the AARTO discount window.
            </p>
          </div>
        }

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ShieldIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{fine.issuedBy}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{fine.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ClockIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            Issued: {formatDate(fine.issuedDate)}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <div className="w-4 h-4 mr-2 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {fine.licensePlate.substring(0, 2)}
            </div>
            {fine.licensePlate}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          {isOpen &&
          <>
              <Button
              variant="secondary"
              size="sm"
              leftIcon={<SparklesIcon className="w-4 h-4 text-blue-600" />}
              onClick={() => onAnalyze?.(fine)}
              className="flex-1 md:flex-none">
              
                AI Analyze
              </Button>
              <Button
              variant="secondary"
              size="sm"
              leftIcon={<ScaleIcon className="w-4 h-4" />}
              onClick={() => onDispute?.(fine)}
              className="flex-1 md:flex-none">
              
                Dispute
              </Button>
              <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCardIcon className="w-4 h-4" />}
              onClick={() => onPay?.(fine)}
              className="flex-1 md:flex-none md:ml-auto">
              
                Pay {formatCurrency(fees.total)}
              </Button>
            </>
          }

          {fine.status === 'disputed' &&
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ScaleIcon className="w-4 h-4" />}
            onClick={() => onDispute?.(fine)}
            className="flex-1 md:flex-none">
            
              View Dispute
            </Button>
          }

          {fine.status === 'paid' &&
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ReceiptIcon className="w-4 h-4" />}
            onClick={() => onViewReceipt?.(fine)}
            className="flex-1 md:flex-none">
            
              View Receipt
            </Button>
          }

          {fine.status === 'dismissed' &&
          <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
              Cancelled by {fine.issuedBy}. Nothing further is payable.
            </p>
          }

          {onViewDetail &&
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRightIcon className="w-4 h-4" />}
            onClick={() => onViewDetail(fine)}
            className={isOpen ? 'w-full md:w-auto md:order-first' : 'ml-auto'}>
            
              Details
            </Button>
          }
        </div>
      </div>
    </motion.div>);

}