import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { FineCard } from '../components/cards/FineCard';
import { AddVehicleModal } from '../components/modals/AddVehicleModal';
import { RenewLicenseModal } from '../components/modals/RenewLicenseModal';
import { PaymentModal } from '../components/modals/PaymentModal';
import { AIAnalysisModal } from '../components/modals/AIAnalysisModal';
import { Fine } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getDiscStatus, daysUntilExpiry } from '../utils/license';
import { pointsForOffence } from '../utils/demerits';
import {
  CarIcon,
  EditIcon,
  IdCardIcon,
  FileTextIcon,
  ReceiptIcon,
  HashIcon,
  GaugeIcon,
  PaletteIcon,
  WeightIcon,
  CogIcon,
  FolderLockIcon,
  AlertTriangleIcon,
  CheckCircleIcon } from
'lucide-react';

export function VehicleDetailPage() {
  const { state, dispatch } = useAppStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const vehicle = state.vehicles.find((v) => v.id === state.activeVehicleId);

  const fines = useMemo(
    () => state.fines.filter((f) => f.vehicleId === state.activeVehicleId),
    [state.fines, state.activeVehicleId]
  );

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vehicle not found" />
        <EmptyState
          icon={<CarIcon className="w-8 h-8" />}
          title="We could not load that vehicle"
          description="It may have been removed from your garage."
          actionLabel="Back to My Vehicles"
          onAction={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'vehicles'
          })
          } />
        
      </div>);

  }

  const outstanding = fines.filter(
    (f) => f.status === 'pending' || f.status === 'overdue'
  );
  const outstandingTotal = outstanding.reduce((sum, f) => sum + f.amount, 0);
  const paidTotal = state.payments.
  filter((p) => p.vehicleId === vehicle.id).
  reduce((sum, p) => sum + p.total, 0);
  const vehiclePoints = fines.
  filter((f) => f.status !== 'dismissed' && f.status !== 'disputed').
  reduce((sum, f) => sum + pointsForOffence(f.offenceType), 0);

  const discStatus = getDiscStatus(vehicle.licenseDiscExpiry);
  const discDays = daysUntilExpiry(vehicle.licenseDiscExpiry);
  const applications = state.licenseApplications.filter(
    (a) => a.vehicleId === vehicle.id
  );
  const documents = state.documents.filter((d) => d.vehicleId === vehicle.id);

  const discMeta = {
    valid: {
      variant: 'success' as const,
      label: 'Disc valid',
      tone: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
      text: 'text-emerald-800 dark:text-emerald-300'
    },
    expiring: {
      variant: 'warning' as const,
      label: 'Disc expiring',
      tone: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50',
      text: 'text-amber-800 dark:text-amber-300'
    },
    expired: {
      variant: 'danger' as const,
      label: 'Disc expired',
      tone: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50',
      text: 'text-red-800 dark:text-red-300'
    }
  }[discStatus];

  const handleAnalyze = (fine: Fine) => {
    setSelectedFine(fine);
    setIsAIOpen(true);
  };
  const handlePay = (fine: Fine) => {
    setSelectedFine(fine);
    setIsPayOpen(true);
  };
  const handleDispute = (fine: Fine) => {
    dispatch({
      type: 'SET_ACTIVE_FINE',
      payload: fine.id
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'dispute'
    });
  };
  const handleViewFine = (fine: Fine) => {
    dispatch({
      type: 'SET_ACTIVE_FINE',
      payload: fine.id
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'fine-detail'
    });
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.25,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="space-y-6">
      
      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        actions={
        <Button
          variant="secondary"
          leftIcon={<EditIcon className="w-4 h-4" />}
          onClick={() => setIsEditOpen(true)}>
          
            Edit
          </Button>
        } />
      

      {/* Identity card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
            <CarIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-xl tracking-widest">
              {vehicle.licensePlate}
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={discMeta.variant}>{discMeta.label}</Badge>
              {outstanding.length > 0 &&
              <Badge variant="warning">
                  {outstanding.length} outstanding{' '}
                  {outstanding.length === 1 ? 'fine' : 'fines'}
                </Badge>
              }
              {vehiclePoints > 0 &&
              <Badge variant="danger" icon={<GaugeIcon className="w-3 h-3" />}>
                  {vehiclePoints} demerit {vehiclePoints === 1 ? 'point' : 'points'}
                </Badge>
              }
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          <SpecItem
            icon={<HashIcon className="w-4 h-4" />}
            label="VIN"
            value={vehicle.vin}
            mono />
          
          <SpecItem
            icon={<CogIcon className="w-4 h-4" />}
            label="Engine number"
            value={vehicle.engineNumber ?? '—'}
            mono />
          
          <SpecItem
            icon={<WeightIcon className="w-4 h-4" />}
            label="Tare weight"
            value={vehicle.tareWeight ? `${vehicle.tareWeight} kg` : '—'} />
          
          <SpecItem
            icon={<PaletteIcon className="w-4 h-4" />}
            label="Colour"
            value={vehicle.color} />
          
        </dl>
      </div>

      {/* Licence disc status — actionable */}
      <div
        className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${discMeta.tone}`}>
        
        <div className="flex items-start gap-3 flex-1">
          <IdCardIcon
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${discMeta.text}`} />
          
          <div>
            <p className={`font-semibold ${discMeta.text}`}>
              {discStatus === 'expired' ?
              `Licence disc expired ${Math.abs(discDays)} days ago` :
              discStatus === 'expiring' ?
              `Licence disc expires in ${discDays} days` :
              `Licence disc valid until ${formatDate(vehicle.licenseDiscExpiry ?? '')}`}
            </p>
            <p className={`text-sm mt-0.5 opacity-90 ${discMeta.text}`}>
              {discStatus === 'expired' ?
              'Arrears accrue at 10% per month. Renew now to stop them building.' :
              discStatus === 'expiring' ?
              'Renew online in about a minute — no queue, no paperwork.' :
              'Nothing to do here for now.'}
            </p>
          </div>
        </div>
        <Button
          variant={discStatus === 'valid' ? 'secondary' : 'primary'}
          onClick={() => setIsRenewOpen(true)}
          className="flex-shrink-0">
          
          {discStatus === 'valid' ? 'Renew early' : 'Renew disc'}
        </Button>
      </div>

      {/* Money summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Outstanding"
          value={formatCurrency(outstandingTotal)}
          detail={`${outstanding.length} unpaid ${outstanding.length === 1 ? 'notice' : 'notices'}`}
          tone="warning" />
        
        <MetricCard
          label="Paid to date"
          value={formatCurrency(paidTotal)}
          detail="Fines and disc renewals"
          tone="neutral" />
        
        <MetricCard
          label="Total notices"
          value={String(fines.length)}
          detail="Across the life of this vehicle"
          tone="neutral" />
        
      </div>

      {/* This vehicle's fines — the cross-link that was missing */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Fines for {vehicle.licensePlate}
          </h2>
          {fines.length > 0 &&
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              dispatch({
                type: 'SET_FINE_VEHICLE_FILTER',
                payload: vehicle.licensePlate
              });
              dispatch({
                type: 'SET_TAB',
                payload: 'fines'
              });
            }}>
            
              Open in Fines
            </Button>
          }
        </div>

        {fines.length === 0 ?
        <EmptyState
          icon={<CheckCircleIcon className="w-8 h-8" />}
          title="No fines on record"
          description="This vehicle has a clean record. Nothing outstanding with any authority." /> :


        <div className="space-y-4">
            {fines.map((fine) =>
          <FineCard
            key={fine.id}
            fine={fine}
            onAnalyze={handleAnalyze}
            onPay={handlePay}
            onDispute={handleDispute}
            onViewDetail={handleViewFine} />

          )}
          </div>
        }
      </section>

      {/* Disc renewal history */}
      {applications.length > 0 &&
      <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Disc renewal history
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {applications.map((app) =>
            <li key={app.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <ReceiptIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {app.applicationType} · {app.discNumber ?? 'pending'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(app.paidAt ?? app.createdAt)} ·{' '}
                      {app.receiptNumber}
                      {app.validUntil &&
                  ` · valid to ${formatDate(app.validUntil)}`}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white flex-shrink-0">
                    {formatCurrency(app.totalAmount)}
                  </p>
                </li>
            )}
            </ul>
          </div>
        </section>
      }

      {/* Linked documents */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Linked documents
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'documents'
            })
            }>
            
            Open vault
          </Button>
        </div>

        {documents.length === 0 ?
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-3">
            <FolderLockIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No registration certificate or roadworthy certificate stored for
              this vehicle yet. Adding them means you always have proof on hand
              at a roadblock.
            </p>
          </div> :

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {documents.map((doc) => {
              const expiringSoon =
              doc.expiresAt &&
              new Date(doc.expiresAt).getTime() - Date.now() <
              30 * 86400000;
              return (
                <li key={doc.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center flex-shrink-0">
                      <FileTextIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {doc.fileType} · added {formatDate(doc.uploadedAt)}
                        {doc.expiresAt &&
                      ` · expires ${formatDate(doc.expiresAt)}`}
                      </p>
                    </div>
                    {expiringSoon ?
                  <Badge
                    variant="warning"
                    size="sm"
                    icon={<AlertTriangleIcon className="w-3 h-3" />}>
                    
                        Expiring
                      </Badge> :

                  <Badge
                    variant={
                    doc.verificationStatus === 'verified' ?
                    'success' :
                    'neutral'
                    }
                    size="sm">
                    
                        {doc.verificationStatus}
                      </Badge>
                  }
                  </li>);

            })}
            </ul>
          </div>
        }
      </section>

      <AddVehicleModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        vehicle={vehicle} />
      
      <RenewLicenseModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        vehicle={vehicle} />
      
      <PaymentModal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        fine={selectedFine} />
      
      <AIAnalysisModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        fine={selectedFine} />
      
    </motion.div>);

}

function SpecItem({
  icon,
  label,
  value,
  mono = false





}: {icon: React.ReactNode;label: string;value: string;mono?: boolean;}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <span className="text-gray-400">{icon}</span>
        {label}
      </dt>
      <dd
        className={`text-sm font-semibold text-gray-900 dark:text-white mt-1.5 break-all ${mono ? 'font-mono text-xs' : ''}`}>
        
        {value}
      </dd>
    </div>);

}

function MetricCard({
  label,
  value,
  detail,
  tone





}: {label: string;value: string;detail: string;tone: 'warning' | 'neutral';}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
      tone === 'warning' ?
      'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' :
      'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'}`
      }>
      
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{detail}</p>
    </div>);

}