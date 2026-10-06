import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { StatCard } from '../components/cards/StatCard';
import { FinesOverTimeChart } from '../components/charts/FinesOverTimeChart';
import { FinesByVehicleChart } from '../components/charts/FinesByVehicleChart';
import { FinesByStatusChart } from '../components/charts/FinesByStatusChart';
import { SpendingTrendChart } from '../components/charts/SpendingTrendChart';
import { RiskScoreCard } from '../components/cards/RiskScoreCard';
import { PageHeader } from '../components/layout/PageHeader';
import { formatCurrency } from '../utils/formatters';
import {
  WalletIcon,
  TrendingDownIcon,
  ScaleIcon,
  AlertTriangleIcon } from
'lucide-react';
export function AnalyticsPage() {
  const { state } = useAppStore();
  const totalSpent = state.fines.
  filter((f) => f.status === 'paid').
  reduce((sum, f) => sum + f.amount, 0);
  const avgFineAmount =
  state.fines.length > 0 ?
  state.fines.reduce((sum, f) => sum + f.amount, 0) / state.fines.length :
  0;
  const resolvedDisputes = state.disputes.filter(
    (d) => d.currentStage === 'resolved'
  ).length;
  const disputeSuccess =
  state.disputes.length > 0 ?
  Math.round(resolvedDisputes / state.disputes.length * 100) :
  68;
  const offenceCounts = state.fines.reduce(
    (acc, fine) => {
      acc[fine.offenceType] = (acc[fine.offenceType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  let topOffence = 'None';
  let maxCount = 0;
  for (const [offence, count] of Object.entries(offenceCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topOffence = offence;
    }
  }
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
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
      className="space-y-6">
      
      <PageHeader
        title="Analytics & Insights"
        description="Deep dive into your driving habits and fine history." />
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          icon={<WalletIcon className="w-6 h-6" />}
          colorClass="text-red-600 bg-red-50 dark:bg-red-900/20" />
        
        <StatCard
          title="Avg. Fine Amount"
          value={formatCurrency(avgFineAmount)}
          icon={<TrendingDownIcon className="w-6 h-6" />}
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        
        <StatCard
          title="Dispute Success"
          value={`${disputeSuccess}%`}
          icon={<ScaleIcon className="w-6 h-6" />}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        
        <StatCard
          title="Top Offence"
          value={topOffence}
          icon={<AlertTriangleIcon className="w-6 h-6" />}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Fines Over Time (Last 12 Months)
        </h3>
        <FinesOverTimeChart />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Fines by Vehicle
          </h3>
          <FinesByVehicleChart />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Status Breakdown
          </h3>
          <FinesByStatusChart />
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Cumulative Spending vs Issued
        </h3>
        <SpendingTrendChart />
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskScoreCard profile={state.riskProfile} />
      </motion.div>
    </motion.div>);

}