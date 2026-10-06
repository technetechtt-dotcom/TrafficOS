import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RenewDriverLicenceModal } from '../components/modals/RenewDriverLicenceModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { deriveDemeritProfile } from '../utils/demerits';
import { DriverLicenceApplicationStage } from '../types';
import {
  ContactIcon,
  CalendarClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  EyeIcon,
  BuildingIcon,
  ClockIcon,
  ShieldOffIcon,
  ArrowRightIcon } from
'lucide-react';
import { toast } from 'sonner';

const STAGE_STEPS: {
  id: DriverLicenceApplicationStage;
  label: string;
  description: string;
}[] = [
{
  id: 'booked',
  label: 'Appointment booked',
  description: 'Your slot at the testing centre is confirmed.'
},
{
  id: 'eye-test',
  label: 'Eye test & capture',
  description: 'Vision screening, fingerprints and photograph taken.'
},
{
  id: 'processing',
  label: 'Card production',
  description: 'Your card is being printed at the DLCA in Pretoria.'
},
{
  id: 'ready',
  label: 'Ready for collection',
  description: 'Collect from the testing centre where you applied.'
}];


export function DriverLicencePage() {
  const { state, dispatch } = useAppStore();
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  const licence = state.driverLicence;
  const demerits = deriveDemeritProfile(state.fines);

  if (!licence) {
    return (
      <div className="space-y-6">
        <PageHeader title="Driver's Licence" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
          <ContactIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            No licence on file
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
            Link your driving licence card to track its expiry and book renewals
            without standing in a queue.
          </p>
        </div>
      </div>);

  }

  const daysLeft = Math.ceil(
    (new Date(licence.expiryDate).getTime() - Date.now()) / 86400000
  );
  const status =
  daysLeft < 0 ? 'expired' : daysLeft <= 90 ? 'expiring' : 'valid';
  const application = licence.application;

  const statusMeta = {
    valid: {
      badge: 'success' as const,
      label: 'Valid',
      surface:
      'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
      text: 'text-emerald-800 dark:text-emerald-300',
      headline: `Valid until ${formatDate(licence.expiryDate)}`,
      body: 'Nothing to do. We will remind you 90 days before it expires.'
    },
    expiring: {
      badge: 'warning' as const,
      label: 'Expiring soon',
      surface:
      'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50',
      text: 'text-amber-800 dark:text-amber-300',
      headline: `Expires in ${daysLeft} days`,
      body: 'You may renew from 180 days before expiry. Booking early avoids the rush and the temporary licence fee.'
    },
    expired: {
      badge: 'danger' as const,
      label: 'Expired',
      surface:
      'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50',
      text: 'text-red-800 dark:text-red-300',
      headline: `Expired ${Math.abs(daysLeft)} days ago`,
      body: 'Driving on an expired licence is an offence. You have a five-year window to renew before you must retest.'
    }
  }[status];

  const currentStepIndex = application ?
  STAGE_STEPS.findIndex((s) => s.id === application.stage) :
  -1;

  const advance = () => {
    if (!application) return;
    const next = STAGE_STEPS[currentStepIndex + 1];
    if (!next) {
      const newExpiry = new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + 5);
      dispatch({
        type: 'COLLECT_LICENCE',
        payload: {
          newExpiry: newExpiry.toISOString()
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          title: 'Licence Card Collected',
          message: `Your new driving licence card is valid until ${formatDate(newExpiry.toISOString())}.`,
          type: 'licence',
          read: false,
          createdAt: new Date().toISOString(),
          linkTab: 'driver-licence'
        }
      });
      toast.success('Licence collected — valid for another five years');
      return;
    }
    dispatch({
      type: 'ADVANCE_LICENCE_RENEWAL',
      payload: next.id
    });
    toast.success(next.label);
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
        title="Driver's Licence"
        description="Your driving licence card — separate from your vehicle licence discs. Track expiry and renew without queueing." />
      

      {/* The card itself, rendered as the physical artefact */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Republic of South Africa
              </p>
              <p className="text-lg font-bold tracking-tight mt-0.5">
                Driving Licence
              </p>
            </div>
            <Badge variant={statusMeta.badge}>{statusMeta.label}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CardField label="Surname, initials" value={state.user?.name ?? '—'} />
            <CardField
              label="Licence number"
              value={licence.licenceNumber}
              mono />
            
            <CardField label="Codes" value={licence.codes.join(' · ')} />
            <CardField
              label="Valid until"
              value={formatDate(licence.expiryDate)} />
            
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
              Restrictions
            </p>
            <p className="text-sm text-white/80 mt-1">
              {licence.restrictions || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Status + primary action */}
      <div
        className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${statusMeta.surface}`}>
        
        <div className="flex items-start gap-3 flex-1">
          {status === 'valid' ?
          <CheckCircleIcon
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusMeta.text}`} /> :


          <AlertTriangleIcon
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusMeta.text}`} />

          }
          <div>
            <p className={`font-semibold ${statusMeta.text}`}>
              {statusMeta.headline}
            </p>
            <p className={`text-sm mt-0.5 opacity-90 ${statusMeta.text}`}>
              {statusMeta.body}
            </p>
          </div>
        </div>
        {!application &&
        <Button
          variant={status === 'valid' ? 'secondary' : 'primary'}
          onClick={() => setIsRenewOpen(true)}
          className="flex-shrink-0">
          
            Book renewal
          </Button>
        }
      </div>

      {/* Suspension warning tied to real demerit data */}
      {demerits.isSuspended &&
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl p-5 flex items-start gap-3">
          <ShieldOffIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-200">
              This licence is at risk of suspension
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
              You have {demerits.activePoints} active demerit points against the{' '}
              {demerits.threshold}-point threshold. Renewal does not clear
              points.
            </p>
            <button
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'aarto-points'
            })
            }
            className="text-sm font-medium text-red-700 dark:text-red-300 underline mt-2">
            
              Review my demerit points
            </button>
          </div>
        </div>
      }

      {/* Active renewal tracking */}
      {application &&
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                Renewal in progress
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {application.testingCentre} ·{' '}
                {formatDate(application.appointmentDate)} · receipt{' '}
                {application.receiptNumber}
              </p>
            </div>
            <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRightIcon className="w-4 h-4" />}
            onClick={advance}>
            
              {currentStepIndex >= STAGE_STEPS.length - 1 ?
            'Confirm collection' :
            'Advance status'}
            </Button>
          </div>

          <ol className="p-6 space-y-0">
            {STAGE_STEPS.map((step, index) => {
            const isDone = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLast = index === STAGE_STEPS.length - 1;
            return (
              <li key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDone ?
                    'bg-blue-600 text-white' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700'}`
                    }>
                    
                      {index === 1 ?
                    <EyeIcon className="w-4 h-4" /> :
                    index === 2 ?
                    <BuildingIcon className="w-4 h-4" /> :
                    index === 3 ?
                    <CheckCircleIcon className="w-4 h-4" /> :

                    <CalendarClockIcon className="w-4 h-4" />
                    }
                    </span>
                    {!isLast &&
                  <span
                    className={`w-px flex-1 my-1 ${isDone ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />

                  }
                  </div>
                  <div className={isLast ? 'pb-0' : 'pb-6'}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                      className={`font-semibold text-sm ${isDone ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                      
                        {step.label}
                      </p>
                      {isCurrent &&
                    <Badge
                      variant="info"
                      size="sm"
                      icon={<ClockIcon className="w-3 h-3" />}>
                      
                          Current
                        </Badge>
                    }
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </li>);

          })}
          </ol>
        </section>
      }

      {/* Reference detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Licence detail
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <Row label="First issued" value={formatDate(licence.firstIssued)} />
            <Row
              label="Vehicle codes"
              value={licence.codes.join(', ')} />
            
            <Row
              label="Professional permit"
              value={
              licence.professionalPermit ?
              `${licence.professionalPermit.code} · to ${formatDate(licence.professionalPermit.expiryDate)}` :
              'Not held'
              } />
            
            <Row
              label="Active demerit points"
              value={`${demerits.activePoints} of ${demerits.threshold}`} />
            
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              What renewal costs
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <Row label="Renewal application" value={formatCurrency(250)} />
            <Row label="Temporary licence (optional)" value={formatCurrency(90)} />
            <Row label="Eye test at centre" value="Included" />
            <Row label="TrafficOS booking fee" value={formatCurrency(35)} />
          </div>
          <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-800/50 flex items-start gap-2.5">
            <InfoIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cards are valid for five years. Production usually takes four to
              six weeks, so a temporary licence is worth taking if your current
              card expires in the interim.
            </p>
          </div>
        </div>
      </div>

      <RenewDriverLicenceModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)} />
      
    </motion.div>);

}

function CardField({
  label,
  value,
  mono = false




}: {label: string;value: string;mono?: boolean;}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
        {label}
      </p>
      <p
        className={`text-sm font-semibold mt-1 truncate ${mono ? 'font-mono' : ''}`}>
        
        {value}
      </p>
    </div>);

}

function Row({ label, value }: {label: string;value: string;}) {
  return (
    <div className="px-5 py-3.5 flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
        {value}
      </span>
    </div>);

}