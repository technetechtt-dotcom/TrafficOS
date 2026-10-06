import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { StatCard } from '../components/cards/StatCard';
import { DisputeStage, DisputeLifecycle } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ScaleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  FastForwardIcon,
  GavelIcon } from
'lucide-react';
import { toast } from 'sonner';

type Filter = 'all' | 'open' | 'resolved';

const STAGE_META: Record<
  DisputeStage,
  {
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  }> =
{
  submitted: {
    label: 'Submitted',
    variant: 'info'
  },
  acknowledged: {
    label: 'Acknowledged',
    variant: 'info'
  },
  under_review: {
    label: 'Under review',
    variant: 'warning'
  },
  hearing_scheduled: {
    label: 'Hearing scheduled',
    variant: 'warning'
  },
  resolved: {
    label: 'Resolved',
    variant: 'success'
  },
  dismissed: {
    label: 'Rejected',
    variant: 'danger'
  },
  appeal: {
    label: 'On appeal',
    variant: 'neutral'
  }
};

const OPEN_STAGES: DisputeStage[] = [
'submitted',
'acknowledged',
'under_review',
'hearing_scheduled',
'appeal'];


export function DisputesPage() {
  const { state, dispatch } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');

  const enriched = useMemo(
    () =>
    state.disputes.map((d) => ({
      dispute: d,
      fine: state.fines.find((f) => f.id === d.fineId)
    })),
    [state.disputes, state.fines]
  );

  const filtered = useMemo(() => {
    if (filter === 'open')
    return enriched.filter((e) => OPEN_STAGES.includes(e.dispute.currentStage));
    if (filter === 'resolved')
    return enriched.filter(
      (e) => !OPEN_STAGES.includes(e.dispute.currentStage)
    );
    return enriched;
  }, [enriched, filter]);

  const openCount = enriched.filter((e) =>
  OPEN_STAGES.includes(e.dispute.currentStage)
  ).length;
  const wonCount = enriched.filter((e) => e.dispute.outcome === 'upheld').length;
  const decidedCount = enriched.filter(
    (e) => !OPEN_STAGES.includes(e.dispute.currentStage)
  ).length;
  const winRate =
  decidedCount > 0 ? Math.round(wonCount / decidedCount * 100) : null;
  const atStake = enriched.
  filter((e) => OPEN_STAGES.includes(e.dispute.currentStage)).
  reduce((sum, e) => sum + (e.fine?.amount ?? 0), 0);

  const openDispute = (dispute: DisputeLifecycle) => {
    dispatch({
      type: 'SET_ACTIVE_FINE',
      payload: dispute.fineId
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'dispute'
    });
  };

  const daysInStage = (dispute: DisputeLifecycle): number => {
    const last = dispute.events.
    filter((e) => e.isComplete && e.timestamp).
    sort(
      (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    const since = last?.timestamp ?? dispute.submittedAt;
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(since).getTime()) / 86400000)
    );
  };

  const filters: {
    label: string;
    value: Filter;
    count: number;
  }[] = [
  {
    label: 'All',
    value: 'all',
    count: enriched.length
  },
  {
    label: 'Open',
    value: 'open',
    count: openCount
  },
  {
    label: 'Decided',
    value: 'resolved',
    count: decidedCount
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
      className="space-y-6">
      
      <PageHeader
        title="My Disputes"
        description="Every representation you have lodged, and exactly where each one stands with the issuing authority." />
      

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open"
          value={openCount}
          icon={<ClockIcon className="w-6 h-6" />}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        
        <StatCard
          title="Upheld"
          value={wonCount}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        
        <StatCard
          title="Success rate"
          value={winRate === null ? 'No data' : `${winRate}%`}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        
        <StatCard
          title="Value at stake"
          value={formatCurrency(atStake)}
          icon={<ScaleIcon className="w-6 h-6" />}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" />
        
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {filters.map((f) =>
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
          filter === f.value ?
          'bg-blue-600 text-white shadow-sm' :
          'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`
          }>
          
            {f.label}
            {f.count > 0 &&
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            
                {f.count}
              </span>
          }
          </button>
        )}
      </div>

      {filtered.length === 0 ?
      <EmptyState
        icon={<ScaleIcon className="w-8 h-8" />}
        title={
        filter === 'all' ? 'No disputes yet' : 'Nothing in this view'
        }
        description={
        filter === 'all' ?
        'When you lodge a representation against a fine it will appear here with full lifecycle tracking.' :
        'Try a different filter to see your other disputes.'
        }
        actionLabel={filter === 'all' ? 'Review my fines' : undefined}
        onAction={
        filter === 'all' ?
        () =>
        dispatch({
          type: 'SET_TAB',
          payload: 'fines'
        }) :
        undefined
        } /> :


      <div className="space-y-4">
          {filtered.map(({ dispute, fine }) => {
          const meta = STAGE_META[dispute.currentStage];
          const isOpen = OPEN_STAGES.includes(dispute.currentStage);
          const stageDays = daysInStage(dispute);

          return (
            <motion.article
              key={dispute.disputeId}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {fine?.offenceType ?? 'Infringement'}
                        </h3>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fine?.referenceNumber} · {fine?.issuedBy} ·{' '}
                        {fine?.licensePlate}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        Lodged {formatDate(dispute.submittedAt)} ·{' '}
                        {stageDays} {stageDays === 1 ? 'day' : 'days'} in
                        current stage
                        {dispute.estimatedResolution &&
                      isOpen &&
                      ` · decision expected ${formatDate(dispute.estimatedResolution)}`}
                      </p>
                    </div>

                    <div className="sm:text-right flex-shrink-0">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(fine?.amount ?? 0)}
                      </p>
                      {dispute.blockchainHash &&
                    <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                          {dispute.blockchainHash.slice(0, 10)}…
                        </p>
                    }
                    </div>
                  </div>

                  {dispute.outcomeNote &&
                <div
                  className={`mt-4 rounded-xl p-3.5 flex items-start gap-2.5 ${
                  dispute.outcome === 'upheld' ?
                  'bg-emerald-50 dark:bg-emerald-900/20' :
                  dispute.outcome === 'reduced' ?
                  'bg-amber-50 dark:bg-amber-900/20' :
                  'bg-red-50 dark:bg-red-900/20'}`
                  }>
                  
                      {dispute.outcome === 'upheld' ?
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" /> :

                  <XCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  }
                      <p
                    className={`text-sm ${
                    dispute.outcome === 'upheld' ?
                    'text-emerald-800 dark:text-emerald-300' :
                    dispute.outcome === 'reduced' ?
                    'text-amber-800 dark:text-amber-300' :
                    'text-red-800 dark:text-red-300'}`
                    }>
                    
                        {dispute.outcomeNote}
                      </p>
                    </div>
                }
                </div>

                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
                  {isOpen &&
                <>
                      <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FastForwardIcon className="w-4 h-4" />}
                    onClick={() => {
                      dispatch({
                        type: 'ADVANCE_DISPUTE',
                        payload: dispute.disputeId
                      });
                      toast.success('Authority response recorded');
                    }}>
                    
                        Check for update
                      </Button>
                      <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<GavelIcon className="w-4 h-4" />}
                    onClick={() => {
                      const outcome =
                      (fine?.amount ?? 0) >= 2000 ? 'upheld' : 'rejected';
                      dispatch({
                        type: 'RESOLVE_DISPUTE',
                        payload: {
                          disputeId: dispute.disputeId,
                          outcome,
                          note:
                          outcome === 'upheld' ?
                          'Representation upheld. The infringement notice has been cancelled and no demerit points attach.' :
                          'Representation rejected. The adjudicator found the evidence sufficient; the penalty remains payable.'
                        }
                      });
                      dispatch({
                        type: 'ADD_NOTIFICATION',
                        payload: {
                          id: `notif_${Date.now()}`,
                          title:
                          outcome === 'upheld' ?
                          'Dispute Upheld' :
                          'Dispute Rejected',
                          message:
                          outcome === 'upheld' ?
                          `${fine?.referenceNumber} has been cancelled following your representation.` :
                          `${fine?.referenceNumber} remains payable. The penalty is now due.`,
                          type: 'dispute',
                          read: false,
                          createdAt: new Date().toISOString(),
                          fineId: dispute.fineId,
                          linkTab: 'disputes'
                        }
                      });
                      toast.success('Adjudication outcome received');
                    }}>
                    
                        Request decision
                      </Button>
                    </>
                }
                  <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ChevronRightIcon className="w-4 h-4" />}
                  onClick={() => openDispute(dispute)}
                  className="ml-auto">
                  
                    View full timeline
                  </Button>
                </div>
              </motion.article>);

        })}
        </div>
      }
    </motion.div>);

}