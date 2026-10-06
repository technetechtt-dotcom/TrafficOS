import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PaymentModal } from '../components/modals/PaymentModal';
import { AIAnalysisModal } from '../components/modals/AIAnalysisModal';
import { FinesMap } from '../components/map/FinesMap';
import { DisputeTimeline } from '../components/dispute/DisputeTimeline';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateFineFees, daysUntil } from '../utils/payments';
import { pointsForOffence } from '../utils/demerits';
import { mockCameraHotspots } from '../data/mockData';
import { Fine, FineStatus } from '../types';
import {
  FileTextIcon,
  CreditCardIcon,
  ScaleIcon,
  SparklesIcon,
  DownloadIcon,
  MapPinIcon,
  CameraIcon,
  GaugeIcon,
  ShieldIcon,
  CalendarIcon,
  TagIcon,
  AlertTriangleIcon,
  CarIcon,
  CheckCircleIcon,
  ReceiptIcon } from
'lucide-react';
import { downloadTextFile, buildReceiptText } from '../utils/payments';
import { toast } from 'sonner';

type DetailTab = 'overview' | 'evidence' | 'location' | 'timeline';

const STATUS_BADGE: Record<
  FineStatus,
  {
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    label: string;
  }> =
{
  pending: {
    variant: 'warning',
    label: 'Pending'
  },
  overdue: {
    variant: 'danger',
    label: 'Overdue'
  },
  paid: {
    variant: 'success',
    label: 'Paid'
  },
  disputed: {
    variant: 'info',
    label: 'Disputed'
  },
  dismissed: {
    variant: 'neutral',
    label: 'Dismissed'
  }
};

export function FineDetailPage() {
  const { state, dispatch } = useAppStore();
  const [tab, setTab] = useState<DetailTab>('overview');
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const fine = state.fines.find((f) => f.id === state.activeFineId);

  if (!fine) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fine not found" />
        <EmptyState
          icon={<FileTextIcon className="w-8 h-8" />}
          title="We could not load that fine"
          description="It may have been removed. Head back to your fines list to pick another."
          actionLabel="Back to Fines"
          onAction={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'fines'
          })
          } />
        
      </div>);

  }

  const vehicle = state.vehicles.find((v) => v.id === fine.vehicleId);
  const dispute = state.disputes.find((d) => d.fineId === fine.id);
  const payment = state.payments.find((p) => p.fineId === fine.id);
  const fees = calculateFineFees(fine);
  const points = pointsForOffence(fine.offenceType);
  const dueIn = daysUntil(fine.dueDate);
  const statusMeta = STATUS_BADGE[fine.status];
  const isSettled = fine.status === 'paid' || fine.status === 'dismissed';

  const nearbyHotspot = mockCameraHotspots.find(
    (h) =>
    fine.lat &&
    fine.lng &&
    Math.abs(h.lat - fine.lat) < 0.05 &&
    Math.abs(h.lng - fine.lng) < 0.05
  );

  const handleDispute = () => {
    dispatch({
      type: 'SET_ACTIVE_FINE',
      payload: fine.id
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'dispute'
    });
  };

  const handleDownloadNotice = () => {
    const notice = [
    '================================================',
    `        INFRINGEMENT NOTICE — ${fine.noticeType ?? 'AARTO 01'}`,
    '================================================',
    '',
    `Reference        : ${fine.referenceNumber}`,
    `Issuing authority: ${fine.issuedBy}`,
    `Date issued      : ${formatDate(fine.issuedDate)}`,
    `Payable by       : ${formatDate(fine.dueDate)}`,
    '',
    `Vehicle          : ${fine.licensePlate}`,
    vehicle ? `Description      : ${vehicle.year} ${vehicle.make} ${vehicle.model}` : '',
    '',
    `Offence          : ${fine.offenceType}`,
    `Particulars      : ${fine.offenceDescription}`,
    `Location         : ${fine.location}`,
    fine.recordedSpeed ?
    `Recorded speed   : ${fine.recordedSpeed} km/h in a ${fine.speedLimit} km/h zone` :
    '',
    `Demerit points   : ${points}`,
    '',
    `Penalty          : ${formatCurrency(fine.amount)}`,
    fees.isDiscountEligible ?
    `Discounted       : ${formatCurrency(fine.amount - fees.discount)} if paid within 32 days` :
    '',
    '',
    'Served in terms of the Administrative Adjudication of',
    'Road Traffic Offences Act 46 of 1998.',
    '================================================'].

    filter(Boolean).
    join('\n');
    downloadTextFile(`Notice_${fine.referenceNumber}.txt`, notice);
    toast.success('Infringement notice downloaded');
  };

  const tabs: {
    id: DetailTab;
    label: string;
  }[] = [
  {
    id: 'overview',
    label: 'Overview'
  },
  {
    id: 'evidence',
    label: 'Evidence'
  },
  {
    id: 'location',
    label: 'Location'
  },
  {
    id: 'timeline',
    label: 'Timeline'
  }];


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
      className="space-y-6 pb-24">
      
      <PageHeader title={fine.offenceType} backLabel="Back" />

      {/* Hero summary — the amount and deadline are what the user came for */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
              <Badge variant="neutral" size="sm">
                {fine.noticeType ?? 'AARTO 01'}
              </Badge>
              {points > 0 &&
              <Badge
                variant="danger"
                size="sm"
                icon={<GaugeIcon className="w-3 h-3" />}>
                
                  {points} demerit {points === 1 ? 'point' : 'points'}
                </Badge>
              }
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
              {fine.offenceDescription}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold tracking-widest text-sm">
                {fine.licensePlate}
              </span>
              {vehicle &&
              <button
                onClick={() => {
                  dispatch({
                    type: 'SET_ACTIVE_VEHICLE',
                    payload: vehicle.id
                  });
                  dispatch({
                    type: 'SET_TAB',
                    payload: 'vehicle-detail'
                  });
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </button>
              }
            </div>
          </div>

          <div className="md:text-right flex-shrink-0">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {isSettled ? 'Penalty' : 'Amount due'}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">
              {formatCurrency(isSettled ? fine.amount : fees.total)}
            </p>
            {!isSettled && fees.discount > 0 &&
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center md:justify-end gap-1">
                <TagIcon className="w-3.5 h-3.5" />
                {formatCurrency(fees.discount)} discount applied
              </p>
            }
            {!isSettled &&
            <p
              className={`text-sm mt-2 font-medium ${dueIn < 0 ? 'text-red-600 dark:text-red-400' : dueIn <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
              
                {dueIn < 0 ?
              `${Math.abs(dueIn)} days overdue` :
              `Due in ${dueIn} days`}
              </p>
            }
          </div>
        </div>

        {!isSettled && fees.isDiscountEligible &&
        <div className="px-6 md:px-8 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800/50 flex items-start gap-3">
            <TagIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              <strong>
                Pay within {fees.daysRemaining}{' '}
                {fees.daysRemaining === 1 ? 'day' : 'days'} and save{' '}
                {formatCurrency(fees.discount)}.
              </strong>{' '}
              AARTO allows a 50% discount when an infringement notice is settled
              inside 32 days of service.
            </p>
          </div>
        }

        {payment &&
        <div className="px-6 md:px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Settled on {formatDate(payment.paidAt)} · receipt{' '}
                <span className="font-mono">{payment.receiptNumber}</span>
              </p>
            </div>
            <Button
            variant="secondary"
            size="sm"
            leftIcon={<ReceiptIcon className="w-4 h-4" />}
            onClick={() => {
              downloadTextFile(
                `Receipt_${payment.receiptNumber}.txt`,
                buildReceiptText(
                  payment,
                  state.user?.name ?? 'Account holder'
                )
              );
              toast.success('Receipt downloaded');
            }}>
            
              Download receipt
            </Button>
          </div>
        }
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div
          className="flex gap-1 overflow-x-auto hide-scrollbar"
          role="tablist">
          
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.id)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ?
                'text-blue-600 dark:text-blue-400' :
                'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`
                }>
                
                {t.label}
                {isActive &&
                <motion.div
                  layoutId="fineDetailTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35
                  }} />

                }
              </button>);

          })}
        </div>
      </div>

      {tab === 'overview' &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DetailGroup title="Infringement">
            <DetailRow
            icon={<FileTextIcon className="w-4 h-4" />}
            label="Reference number"
            value={fine.referenceNumber}
            mono />
          
            <DetailRow
            icon={<ShieldIcon className="w-4 h-4" />}
            label="Issuing authority"
            value={fine.issuedBy} />
          
            <DetailRow
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Date issued"
            value={formatDate(fine.issuedDate)} />
          
            <DetailRow
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Payable by"
            value={formatDate(fine.dueDate)} />
          
            <DetailRow
            icon={<MapPinIcon className="w-4 h-4" />}
            label="Location"
            value={fine.location} />
          
          </DetailGroup>

          <DetailGroup title="Consequences">
            <DetailRow
            icon={<GaugeIcon className="w-4 h-4" />}
            label="Demerit points"
            value={
            points > 0 ?
            `${points} ${points === 1 ? 'point' : 'points'} on conviction` :
            'No points — administrative offence'
            } />
          
            <DetailRow
            icon={<CreditCardIcon className="w-4 h-4" />}
            label="Penalty"
            value={formatCurrency(fine.amount)} />
          
            <DetailRow
            icon={<TagIcon className="w-4 h-4" />}
            label="Discounted amount"
            value={
            fees.isDiscountEligible ?
            `${formatCurrency(fine.amount - fees.discount)} until day 32` :
            'Discount window has closed'
            } />
          
            {fees.courtesyFee > 0 &&
          <DetailRow
            icon={<AlertTriangleIcon className="w-4 h-4" />}
            label="Courtesy letter fee"
            value={formatCurrency(fees.courtesyFee)} />

          }
            <DetailRow
            icon={<CarIcon className="w-4 h-4" />}
            label="Vehicle"
            value={
            vehicle ?
            `${vehicle.licensePlate} · ${vehicle.year} ${vehicle.make} ${vehicle.model}` :
            fine.licensePlate
            } />
          
          </DetailGroup>
        </div>
      }

      {tab === 'evidence' &&
      <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <img
            src={
            fine.imageUrl ??
            'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80'
            }
            alt={`Enforcement photograph for ${fine.referenceNumber}`}
            className="w-full h-64 md:h-80 object-cover bg-gray-100 dark:bg-gray-800" />
          
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <EvidenceStat
              label="Camera ID"
              value={fine.cameraId ?? 'CAM-4471-A'} />
            
              <EvidenceStat
              label="Captured"
              value={formatDate(fine.issuedDate)} />
            
              <EvidenceStat
              label="Recorded speed"
              value={
              fine.recordedSpeed ? `${fine.recordedSpeed} km/h` : '—'
              } />
            
              <EvidenceStat
              label="Speed limit"
              value={fine.speedLimit ? `${fine.speedLimit} km/h` : '—'} />
            
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50">
            <CameraIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              You are entitled to request the calibration certificate for the
              measuring equipment and the full evidence pack from the issuing
              authority. Missing or expired calibration records are a common
              ground for a successful representation.
            </p>
          </div>
        </div>
      }

      {tab === 'location' &&
      <div className="space-y-4">
          {fine.lat && fine.lng ?
        <div className="h-[360px]">
              <FinesMap viewMode="fines" fines={[fine]} hotspots={[]} />
            </div> :

        <EmptyState
          icon={<MapPinIcon className="w-8 h-8" />}
          title="No coordinates recorded"
          description="This notice did not include GPS coordinates, so we cannot place it on the map." />

        }

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow
            icon={<MapPinIcon className="w-4 h-4" />}
            label="Recorded location"
            value={fine.location} />
          
            {nearbyHotspot &&
          <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                    <AlertTriangleIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Known enforcement hotspot
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {nearbyHotspot.name} has a{' '}
                      {nearbyHotspot.disputeRate}% dispute success rate across{' '}
                      {nearbyHotspot.totalFines.toLocaleString('en-ZA')}{' '}
                      recorded fines.
                    </p>
                    <button
                  onClick={() =>
                  dispatch({
                    type: 'SET_TAB',
                    payload: 'map'
                  })
                  }
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2">
                  
                      View on hotspot map
                    </button>
                  </div>
                </div>
              </div>
          }
          </div>
        </div>
      }

      {tab === 'timeline' &&
      <div className="space-y-4">
          {dispute ?
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Dispute progress
                </h3>
                <Button
              variant="ghost"
              size="sm"
              onClick={handleDispute}
              rightIcon={<ScaleIcon className="w-4 h-4" />}>
              
                  Open dispute
                </Button>
              </div>
              <DisputeTimeline lifecycle={dispute} />
            </div> :

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <ol className="space-y-0">
                <StaticTimelineRow
              title="Infringement recorded"
              date={formatDate(fine.issuedDate)}
              description={`Captured by ${fine.issuedBy} at ${fine.location}.`}
              isComplete />
            
                <StaticTimelineRow
              title="Notice served"
              date={formatDate(fine.issuedDate)}
              description="Infringement notice dispatched to your registered address."
              isComplete />
            
                <StaticTimelineRow
              title="Discount window closes"
              date={formatDate(
                new Date(
                  new Date(fine.issuedDate).getTime() + 32 * 86400000
                ).toISOString()
              )}
              description="50% early-payment discount falls away after this date."
              isComplete={!fees.isDiscountEligible} />
            
                <StaticTimelineRow
              title={
              fine.status === 'paid' ?
              'Settled' :
              fine.status === 'dismissed' ?
              'Dismissed' :
              'Payment due'
              }
              date={formatDate(fine.dueDate)}
              description={
              fine.status === 'paid' ?
              'Payment received in full.' :
              fine.status === 'dismissed' ?
              'Notice cancelled by the issuing authority.' :
              'Settle or lodge a representation before this date.'
              }
              isComplete={isSettled}
              isLast />
            
              </ol>
            </div>
        }
        </div>
      }

      {/* Sticky action bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<DownloadIcon className="w-4 h-4" />}
            onClick={handleDownloadNotice}
            className="hidden sm:inline-flex">
            
            Notice
          </Button>
          {!isSettled &&
          <>
              <Button
              variant="secondary"
              size="sm"
              leftIcon={<SparklesIcon className="w-4 h-4 text-blue-600" />}
              onClick={() => setIsAIOpen(true)}
              className="flex-1 sm:flex-none">
              
                AI analyse
              </Button>
              <Button
              variant="secondary"
              size="sm"
              leftIcon={<ScaleIcon className="w-4 h-4" />}
              onClick={handleDispute}
              className="flex-1 sm:flex-none">
              
                {dispute ? 'View dispute' : 'Dispute'}
              </Button>
              <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCardIcon className="w-4 h-4" />}
              onClick={() => setIsPayOpen(true)}
              className="flex-1 sm:flex-none sm:ml-auto">
              
                Pay {formatCurrency(fees.total)}
              </Button>
            </>
          }
          {isSettled &&
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'fines'
            })
            }
            className="ml-auto">
            
              Back to all fines
            </Button>
          }
        </div>
      </div>

      <PaymentModal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        fine={fine} />
      
      <AIAnalysisModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        fine={fine} />
      
    </motion.div>);

}

function DetailGroup({
  title,
  children



}: {title: string;children: React.ReactNode;}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {children}
      </div>
    </div>);

}

function DetailRow({
  icon,
  label,
  value,
  mono = false





}: {icon: React.ReactNode;label: string;value: string;mono?: boolean;}) {
  return (
    <div className="px-5 py-3.5 flex items-start justify-between gap-4">
      <span className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
        <span className="text-gray-400">{icon}</span>
        {label}
      </span>
      <span
        className={`text-sm font-medium text-gray-900 dark:text-white text-right ${mono ? 'font-mono' : ''}`}>
        
        {value}
      </span>
    </div>);

}

function EvidenceStat({ label, value }: {label: string;value: string;}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
    </div>);

}

function StaticTimelineRow({
  title,
  date,
  description,
  isComplete,
  isLast = false






}: {title: string;date: string;description: string;isComplete: boolean;isLast?: boolean;}) {
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isComplete ?
          'bg-blue-600 text-white' :
          'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700'}`
          }>
          
          {isComplete ?
          <CheckCircleIcon className="w-4 h-4" /> :

          <CalendarIcon className="w-4 h-4" />
          }
        </span>
        {!isLast &&
        <span className="w-px flex-1 bg-gray-200 dark:bg-gray-800 my-1" />
        }
      </div>
      <div className={isLast ? 'pb-0' : 'pb-6'}>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            {title}
          </p>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
    </li>);

}