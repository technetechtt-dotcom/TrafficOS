import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { StatCard } from '../components/cards/StatCard';
import { FineCard } from '../components/cards/FineCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AIAnalysisModal } from '../components/modals/AIAnalysisModal';
import { PaymentModal } from '../components/modals/PaymentModal';
import { AddVehicleModal } from '../components/modals/AddVehicleModal';
import { SyncModal } from '../components/modals/SyncModal';
import { RiskScoreCard } from '../components/cards/RiskScoreCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateFineFees } from '../utils/payments';
import { deriveDemeritProfile, demeritLevel } from '../utils/demerits';
import { mockAIAnalyses } from '../data/mockData';
import { Fine } from '../types';
import {
  FileTextIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  PlusIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  BarChart3Icon,
  IdCardIcon,
  GaugeIcon,
  ScaleIcon,
  TagIcon,
  ContactIcon } from
'lucide-react';
import { getDiscStatus, daysUntilExpiry } from '../utils/license';

export function DashboardPage() {
  const { state, dispatch } = useAppStore();
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalFines = state.fines.length;
  const outstandingFines = state.fines.filter(
    (f) => f.status === 'pending' || f.status === 'overdue'
  );
  const outstandingAmount = outstandingFines.reduce(
    (sum, f) => sum + f.amount,
    0
  );
  const paidAmount = state.payments.
  filter((p) => p.status === 'succeeded').
  reduce((sum, p) => sum + p.total, 0);

  // Derived from the actual AI analyses rather than a hardcoded count
  const disputable = useMemo(
    () =>
    outstandingFines.filter(
      (fine) => mockAIAnalyses[fine.id]?.recommendation === 'dispute'
    ),
    [outstandingFines]
  );
  const potentialSavings = disputable.reduce((sum, f) => sum + f.amount, 0);

  const savableNow = useMemo(
    () =>
    outstandingFines.reduce(
      (sum, f) => sum + calculateFineFees(f).discount,
      0
    ),
    [outstandingFines]
  );

  const demerits = deriveDemeritProfile(state.fines);
  const demeritTone = demeritLevel(demerits.activePoints);

  const openDisputes = state.disputes.filter(
    (d) => d.currentStage !== 'resolved' && d.currentStage !== 'dismissed'
  );

  // Licence alerts
  const expiredDiscs = state.vehicles.filter(
    (v) => getDiscStatus(v.licenseDiscExpiry) === 'expired'
  );
  const expiringDiscs = state.vehicles.filter(
    (v) => getDiscStatus(v.licenseDiscExpiry) === 'expiring'
  );
  const hasDiscAlerts = expiredDiscs.length > 0 || expiringDiscs.length > 0;
  const discSeverity = expiredDiscs.length > 0 ? 'expired' : 'expiring';

  const licenceDaysLeft = state.driverLicence ?
  Math.ceil(
    (new Date(state.driverLicence.expiryDate).getTime() - Date.now()) /
    86400000
  ) :
  null;
  const licenceNeedsAction =
  licenceDaysLeft !== null && licenceDaysLeft <= 90;

  const handleAnalyze = (fine: Fine) => {
    setSelectedFine(fine);
    setIsAIModalOpen(true);
  };
  const handlePay = (fine: Fine) => {
    setSelectedFine(fine);
    setIsPaymentModalOpen(true);
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
  const handleViewDetail = (fine: Fine) => {
    dispatch({
      type: 'SET_ACTIVE_FINE',
      payload: fine.id
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'fine-detail'
    });
  };

  const go = (tab: Parameters<typeof dispatch>[0] extends never ? never : any) =>
  dispatch({
    type: 'SET_TAB',
    payload: tab
  });

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 16
    },
    show: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {state.user?.name.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's where you stand across fines, licences and disputes.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            leftIcon={<RefreshCwIcon className="w-4 h-4" />}
            onClick={() => setIsSyncModalOpen(true)}
            className="hidden sm:flex">
            
            Sync AARTO
          </Button>
          <Button
            variant="primary"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setIsAddVehicleModalOpen(true)}>
            
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Time-sensitive money alert wins the top slot when it applies */}
      {savableNow > 0 &&
      <motion.button
        variants={itemVariants}
        onClick={() => go('fines')}
        className="w-full text-left rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
        
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <TagIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-200">
                Save {formatCurrency(savableNow)} by paying early
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                AARTO gives you 50% off notices settled within 32 days. That
                window is still open on{' '}
                {
              outstandingFines.filter(
                (f) => calculateFineFees(f).isDiscountEligible
              ).length
              }{' '}
                of your fines.
              </p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          </div>
        </motion.button>
      }

      {/* Licence disc alert */}
      {hasDiscAlerts &&
      <motion.button
        variants={itemVariants}
        onClick={() => go('licenses')}
        className={`w-full text-left rounded-2xl p-5 border transition-colors ${discSeverity === 'expired' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}>
        
          <div className="flex items-center gap-4">
            <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${discSeverity === 'expired' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
            
              <IdCardIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
              className={`font-bold ${discSeverity === 'expired' ? 'text-red-900 dark:text-red-200' : 'text-amber-900 dark:text-amber-200'}`}>
              
                {discSeverity === 'expired' ?
              `${expiredDiscs.length} licence ${expiredDiscs.length === 1 ? 'disc has' : 'discs have'} expired` :
              `${expiringDiscs.length} licence ${expiringDiscs.length === 1 ? 'disc' : 'discs'} expiring soon`}
              </h3>
              <p
              className={`text-sm mt-0.5 ${discSeverity === 'expired' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
              
                {discSeverity === 'expired' ?
              'Renew now to stop arrears building at 10% per month.' :
              `${expiringDiscs[0].licensePlate} expires in ${daysUntilExpiry(expiringDiscs[0].licenseDiscExpiry)} days · renew online in about a minute`}
              </p>
            </div>
            <ChevronRightIcon
            className={`w-5 h-5 flex-shrink-0 ${discSeverity === 'expired' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          
          </div>
        </motion.button>
      }

      {/* AI insight banner */}
      {disputable.length > 0 &&
      <motion.div
        variants={itemVariants}
        className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
        
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <SparklesIcon className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {disputable.length} {disputable.length === 1 ? 'fine' : 'fines'}{' '}
                  worth disputing
                </h3>
                <p className="text-blue-100">
                  Our analysis found grounds that could cancel{' '}
                  {formatCurrency(potentialSavings)} in penalties.
                </p>
              </div>
            </div>
            <Button
            variant="secondary"
            className="bg-white text-blue-700 hover:bg-blue-50 border-none whitespace-nowrap"
            onClick={() => go('fines')}>
            
              Review Fines
            </Button>
          </div>
        </motion.div>
      }

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fines"
          value={totalFines}
          icon={<FileTextIcon className="w-6 h-6" />}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        
        <StatCard
          title="Outstanding"
          value={formatCurrency(outstandingAmount)}
          icon={<AlertTriangleIcon className="w-6 h-6" />}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        
        <StatCard
          title="Paid"
          value={formatCurrency(paidAmount)}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        
        <StatCard
          title="Disputable"
          value={disputable.length}
          icon={<SparklesIcon className="w-6 h-6" />}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Fines
              </h2>
              <Button
                variant="ghost"
                rightIcon={<ChevronRightIcon className="w-4 h-4" />}
                onClick={() => go('fines')}>
                
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {state.fines.slice(0, 3).map((fine) =>
              <FineCard
                key={fine.id}
                fine={fine}
                onAnalyze={handleAnalyze}
                onPay={handlePay}
                onDispute={handleDispute}
                onViewDetail={handleViewDetail}
                onViewReceipt={() => go('payments')} />

              )}
            </div>
          </div>

          {/* Active disputes preview */}
          {openDisputes.length > 0 &&
          <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Active Disputes
                </h2>
                <Button
                variant="ghost"
                rightIcon={<ChevronRightIcon className="w-4 h-4" />}
                onClick={() => go('disputes')}>
                
                  View All
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {openDisputes.slice(0, 3).map((dispute) => {
                  const fine = state.fines.find(
                    (f) => f.id === dispute.fineId
                  );
                  return (
                    <li key={dispute.disputeId}>
                        <button
                        onClick={() => {
                          dispatch({
                            type: 'SET_ACTIVE_FINE',
                            payload: dispute.fineId
                          });
                          go('dispute');
                        }}
                        className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                            <ScaleIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {fine?.offenceType ?? 'Infringement'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {fine?.referenceNumber} · lodged{' '}
                              {formatDate(dispute.submittedAt)}
                            </p>
                          </div>
                          <Badge variant="info" size="sm">
                            {dispute.currentStage.replace(/_/g, ' ')}
                          </Badge>
                          <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        </button>
                      </li>);

                })}
                </ul>
              </div>
            </div>
          }
        </div>

        <div className="space-y-6">
          {/* Demerit points — real data, compact */}
          <button
            onClick={() => go('aarto-points')}
            className="w-full text-left bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <GaugeIcon className="w-5 h-5 mr-2 text-blue-600" />
                Demerit Points
              </h3>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {demerits.activePoints}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                / {demerits.threshold} points
              </span>
            </div>

            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{
                  width: 0
                }}
                animate={{
                  width: `${Math.min(100, demerits.activePoints / demerits.threshold * 100)}%`
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.23, 1, 0.32, 1]
                }}
                className={`h-full rounded-full ${
                demeritTone === 'critical' ?
                'bg-red-500' :
                demeritTone === 'warning' ?
                'bg-amber-500' :
                'bg-emerald-500'}`
                } />
              
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {demerits.isSuspended ?
              'At suspension threshold — review immediately.' :
              `${demerits.threshold - demerits.activePoints} points until suspension · next reduction ${formatDate(demerits.nextReductionDate)}`}
            </p>
          </button>

          <RiskScoreCard profile={state.riskProfile} compact />

          {/* Driver's licence */}
          {state.driverLicence &&
          <button
            onClick={() => go('driver-licence')}
            className={`w-full text-left p-5 rounded-2xl border transition-colors ${
            licenceNeedsAction ?
            'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30' :
            'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:border-gray-200 dark:hover:border-gray-700'}`
            }>
            
              <div className="flex items-center justify-between mb-2">
                <h3
                className={`font-bold flex items-center ${licenceNeedsAction ? 'text-amber-900 dark:text-amber-200' : 'text-gray-900 dark:text-white'}`}>
                
                  <ContactIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Driver's Licence
                </h3>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
              <p
              className={`text-sm ${licenceNeedsAction ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}`}>
              
                {licenceDaysLeft !== null && licenceDaysLeft < 0 ?
              `Expired ${Math.abs(licenceDaysLeft)} days ago — renew now` :
              licenceNeedsAction ?
              `Expires in ${licenceDaysLeft} days · book your renewal` :
              `Valid until ${formatDate(state.driverLicence.expiryDate)}`}
              </p>
            </button>
          }

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-3">
              <BarChart3Icon className="w-5 h-5 mr-2 text-blue-600" />
              Analytics
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Charts of your fine history, spending trends and vehicle
              breakdowns.
            </p>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => go('analytics')}>
              
              View Full Analytics
            </Button>
          </div>
        </div>
      </div>

      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        fine={selectedFine} />
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fine={selectedFine} />
      
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)} />
      
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)} />
      
    </motion.div>);

}