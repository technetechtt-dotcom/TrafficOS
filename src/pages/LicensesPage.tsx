import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { LicenseDiscCard } from '../components/cards/LicenseDiscCard';
import { RenewLicenseModal } from '../components/modals/RenewLicenseModal';
import { EmptyState } from '../components/ui/EmptyState';
import { StatCard } from '../components/cards/StatCard';
import { LicenseDiscApplication, Vehicle } from '../types';
import { getDiscStatus } from '../utils/license';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadTextFile } from '../utils/payments';
import {
  IdCardIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  ReceiptIcon,
  DownloadIcon } from
'lucide-react';
import { toast } from 'sonner';
export function LicensesPage() {
  const { state } = useAppStore();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const summary = useMemo(() => {
    const valid = state.vehicles.filter(
      (v) => getDiscStatus(v.licenseDiscExpiry) === 'valid'
    ).length;
    const expiring = state.vehicles.filter(
      (v) => getDiscStatus(v.licenseDiscExpiry) === 'expiring'
    ).length;
    const expired = state.vehicles.filter(
      (v) => getDiscStatus(v.licenseDiscExpiry) === 'expired'
    ).length;
    return {
      valid,
      expiring,
      expired
    };
  }, [state.vehicles]);
  const handleRenew = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsRenewOpen(true);
  };
  /** Re-issues the disc certificate for a past renewal. */
  const handleDownloadDisc = (app: LicenseDiscApplication) => {
    const vehicle = state.vehicles.find((v) => v.id === app.vehicleId);
    const text = [
    '═══════════════════════════════════════════',
    '       SOUTH AFRICAN MOTOR VEHICLE',
    '          LICENCE DISC CERTIFICATE',
    '═══════════════════════════════════════════',
    '',
    `Licence Number:    ${app.discNumber ?? '—'}`,
    `Receipt Number:    ${app.receiptNumber}`,
    '',
    'VEHICLE DETAILS',
    '───────────────────────────────────────────',
    `Registration:      ${app.licensePlate}`,
    vehicle ? `Make / Model:      ${vehicle.make} ${vehicle.model}` : '',
    vehicle ? `VIN:               ${vehicle.vin}` : '',
    '',
    'VALIDITY',
    '───────────────────────────────────────────',
    `Valid From:        ${app.validFrom ? formatDate(app.validFrom) : '—'}`,
    `Valid Until:       ${app.validUntil ? formatDate(app.validUntil) : '—'}`,
    '',
    'PAYMENT SUMMARY',
    '───────────────────────────────────────────',
    `Base Fee:          ${formatCurrency(app.baseFee)}`,
    `Admin Fee:         ${formatCurrency(app.adminFee)}`,
    `Arrears:           ${formatCurrency(app.arrearFee)}`,
    `TOTAL PAID:        ${formatCurrency(app.totalAmount)}`,
    '',
    '═══════════════════════════════════════════',
    'Issued via TrafficOS SA',
    '═══════════════════════════════════════════'].

    filter(Boolean).
    join('\n');
    downloadTextFile(`Disc_${app.receiptNumber}.txt`, text);
    toast.success('Certificate downloaded');
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6">
      
      <PageHeader
        title="Licence Discs"
        description="Apply, renew and pay for your motor vehicle licence discs online." />
      

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard
          title="Valid"
          value={summary.valid}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        
        <StatCard
          title="Expiring"
          value={summary.expiring}
          icon={<ClockIcon className="w-6 h-6" />}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        
        <StatCard
          title="Expired"
          value={summary.expired}
          icon={<AlertTriangleIcon className="w-6 h-6" />}
          colorClass="text-red-600 bg-red-50 dark:bg-red-900/20" />
        
      </div>

      {/* Vehicle disc cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Your Vehicles
        </h2>
        {state.vehicles.length === 0 ?
        <EmptyState
          icon={<IdCardIcon className="w-8 h-8" />}
          title="No vehicles registered"
          description="Add a vehicle first to apply for or renew its license disc." /> :


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.vehicles.map((vehicle) =>
          <LicenseDiscCard
            key={vehicle.id}
            vehicle={vehicle}
            onRenew={handleRenew} />

          )}
          </div>
        }
      </div>

      {/* Application history */}
      {state.licenseApplications.length > 0 &&
      <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Renewal History
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {state.licenseApplications.map((app) =>
            <button
              key={app.id}
              onClick={() => handleDownloadDisc(app)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <ReceiptIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {app.licensePlate}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ·
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {app.applicationType}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {app.paidAt ?
                  formatDate(app.paidAt) :
                  formatDate(app.createdAt)}{' '}
                      · {app.receiptNumber}
                      {app.validUntil &&
                  ` · valid to ${formatDate(app.validUntil)}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(app.totalAmount)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium capitalize">
                      {app.status}
                    </p>
                  </div>
                  <DownloadIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                </button>
            )}
            </div>
          </div>
        </div>
      }

      <RenewLicenseModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        vehicle={selectedVehicle} />
      
    </motion.div>);

}