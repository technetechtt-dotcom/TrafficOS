import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';
import {
  deriveDemeritProfile,
  demeritLevel,
  demeritLevelCopy,
  DEMERIT_THRESHOLD } from
'../utils/demerits';
import {
  GaugeIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  CalendarClockIcon,
  TrendingDownIcon,
  ChevronRightIcon,
  ShieldOffIcon } from
'lucide-react';

const LEVEL_STYLES = {
  clear: {
    ring: 'text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    surface:
    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
    badge: 'success' as const
  },
  caution: {
    ring: 'text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    surface:
    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
    badge: 'success' as const
  },
  warning: {
    ring: 'text-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    surface:
    'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50',
    badge: 'warning' as const
  },
  critical: {
    ring: 'text-red-500',
    text: 'text-red-700 dark:text-red-400',
    surface:
    'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50',
    badge: 'danger' as const
  }
};

export function AartoPointsPage() {
  const { state, dispatch } = useAppStore();
  const profile = deriveDemeritProfile(state.fines);
  const level = demeritLevel(profile.activePoints);
  const copy = demeritLevelCopy(level);
  const styles = LEVEL_STYLES[level];

  const remaining = Math.max(0, DEMERIT_THRESHOLD - profile.activePoints);
  const percentage = Math.min(
    100,
    profile.activePoints / DEMERIT_THRESHOLD * 100
  );
  const circumference = 2 * Math.PI * 42;

  const provisional = state.fines.filter((f) => f.status === 'disputed').length;

  const openFine = (fineId: string) => {
    dispatch({
      type: 'SET_ACTIVE_FINE',
      payload: fineId
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
        title="Demerit Points"
        description="Your live AARTO demerit position, calculated from the infringements on your record." />
      

      {/* Primary status — the single thing the user came for */}
      <div
        className={`rounded-3xl border p-6 md:p-8 ${styles.surface} flex flex-col md:flex-row items-center gap-8`}>
        
        <div className="relative w-44 h-44 flex-shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true">
            
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-900/10 dark:text-white/10" />
            
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={styles.ring}
              strokeDasharray={circumference}
              initial={{
                strokeDashoffset: circumference
              }}
              animate={{
                strokeDashoffset:
                circumference - percentage / 100 * circumference
              }}
              transition={{
                duration: 0.9,
                ease: [0.23, 1, 0.32, 1]
              }} />
            
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              {profile.activePoints}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              of {DEMERIT_THRESHOLD} points
            </span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left min-w-0">
          <Badge variant={styles.badge}>{copy.label}</Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-3 tracking-tight">
            {profile.isSuspended ?
            'Your licence is at suspension threshold' :
            `${remaining} ${remaining === 1 ? 'point' : 'points'} until suspension`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-lg">
            {copy.description}
          </p>

          {profile.isSuspended &&
          <div className="mt-4 flex items-start gap-2.5 text-left bg-white/60 dark:bg-gray-900/40 rounded-xl p-3.5">
              <ShieldOffIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                At {DEMERIT_THRESHOLD} points your licence is suspended for
                three months for every point in excess of the threshold — a{' '}
                <strong>{profile.suspensionMonths}-month suspension</strong> on
                your current record.
              </p>
            </div>
          }
        </div>
      </div>

      {/* Forward-looking numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard
          icon={<TrendingDownIcon className="w-5 h-5" />}
          label="Next point reduction"
          value={formatDate(profile.nextReductionDate)}
          detail="One point falls away for every three months without a new infringement." />
        
        <InfoCard
          icon={<CalendarClockIcon className="w-5 h-5" />}
          label="Next points expiry"
          value={
          profile.nextExpiry ? formatDate(profile.nextExpiry.expiresAt) : '—'
          }
          detail={
          profile.nextExpiry ?
          `${profile.nextExpiry.points} ${profile.nextExpiry.points === 1 ? 'point' : 'points'} from ${profile.nextExpiry.offenceType} will lapse.` :
          'You have no active points on record.'
          } />
        
        <InfoCard
          icon={<InfoIcon className="w-5 h-5" />}
          label="Provisional (under dispute)"
          value={`${provisional} ${provisional === 1 ? 'notice' : 'notices'}`}
          detail="Points from disputed notices only attach once the representation is decided." />
        
      </div>

      {/* How it works — genuinely needed context, most SA drivers don't know this */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          How AARTO demerit points work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Rule
            number="01"
            title="Every driver starts on zero"
            body="Points are recorded against you personally, not against a vehicle, and only once an infringement is paid or you are found liable." />
          
          <Rule
            number="02"
            title="Twelve points triggers suspension"
            body="Reach the threshold and your licence is suspended for three months for each point above it. A third suspension cancels the licence entirely." />
          
          <Rule
            number="03"
            title="Points lapse after three years"
            body="Each point expires three years after the date of the infringement that caused it." />
          
          <Rule
            number="04"
            title="Clean driving reduces your total"
            body="One point is deducted for every three months you go without a new infringement." />
          
        </div>
      </section>

      {/* History, linked to the actual fines */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Points on record
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {profile.events.length}{' '}
            {profile.events.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {profile.events.length === 0 ?
        <EmptyState
          icon={<CheckCircleIcon className="w-8 h-8" />}
          title="No demerit points on record"
          description="None of your infringements carry demerit points. Parking and licence-disc offences are administrative and never attach points." /> :


        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {profile.events.map((event) =>
            <li key={event.id}>
                  <button
                onClick={() => openFine(event.fineId)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                
                    <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  event.isActive ?
                  'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-400'}`
                  }>
                  
                      {event.isActive ?
                  <AlertTriangleIcon className="w-5 h-5" /> :

                  <CheckCircleIcon className="w-5 h-5" />
                  }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {event.offenceType}
                        </p>
                        {!event.isActive &&
                    <Badge variant="neutral" size="sm">
                            Lapsed
                          </Badge>
                    }
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {event.licensePlate} · incurred{' '}
                        {formatDate(event.incurredAt)} ·{' '}
                        {event.isActive ? 'lapses' : 'lapsed'}{' '}
                        {formatDate(event.expiresAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                    className={`text-xl font-bold ${event.isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                    
                        +{event.points}
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </button>
                </li>
            )}
            </ul>
          </div>
        }
      </section>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <GaugeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              Think a point was recorded incorrectly?
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
              Points follow the underlying infringement. Dispute the notice and,
              if your representation succeeds, the points fall away with it.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'fines'
          })
          }
          className="flex-shrink-0">
          
          Review my fines
        </Button>
      </div>
    </motion.div>);

}

function InfoCard({
  icon,
  label,
  value,
  detail





}: {icon: React.ReactNode;label: string;value: string;detail: string;}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
        {detail}
      </p>
    </div>);

}

function Rule({
  number,
  title,
  body




}: {number: string;title: string;body: string;}) {
  return (
    <div className="flex gap-3">
      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 pt-0.5">
        {number}
      </span>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
          {body}
        </p>
      </div>
    </div>);

}