import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { FineCard } from '../components/cards/FineCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { AIAnalysisModal } from '../components/modals/AIAnalysisModal';
import { PaymentModal } from '../components/modals/PaymentModal';
import { PhotoUploadModal } from '../components/modals/PhotoUploadModal';
import { Fine, FineStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateFineFees } from '../utils/payments';
import {
  SearchIcon,
  FileTextIcon,
  CameraIcon,
  XIcon,
  CarIcon,
  TagIcon } from
'lucide-react';

export function FinesPage() {
  const { state, dispatch } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FineStatus | 'all'>('all');
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const vehicleFilter = state.fineVehicleFilter;

  const filteredFines = useMemo(() => {
    return state.fines.filter((fine) => {
      const matchesSearch =
      fine.offenceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.referenceNumber.
      toLowerCase().
      includes(searchQuery.toLowerCase()) ||
      fine.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
      statusFilter === 'all' || fine.status === statusFilter;
      const matchesVehicle =
      !vehicleFilter || fine.licensePlate === vehicleFilter;
      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [state.fines, searchQuery, statusFilter, vehicleFilter]);

  // Money the user can still save by acting inside the discount window
  const savableTotal = useMemo(
    () =>
    state.fines.
    filter((f) => f.status === 'pending' || f.status === 'overdue').
    reduce((sum, f) => {
      const fees = calculateFineFees(f);
      return sum + fees.discount;
    }, 0),
    [state.fines]
  );

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
  const handleViewReceipt = (fine: Fine) => {
    dispatch({
      type: 'SET_TAB',
      payload: 'payments'
    });
  };

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

  const filters: {
    label: string;
    value: FineStatus | 'all';
  }[] = [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'Pending',
    value: 'pending'
  },
  {
    label: 'Paid',
    value: 'paid'
  },
  {
    label: 'Disputed',
    value: 'disputed'
  },
  {
    label: 'Dismissed',
    value: 'dismissed'
  }];


  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6">
      
      <PageHeader
        title="My Fines"
        description="View, pay or dispute every infringement notice linked to your vehicles." />
      

      {savableTotal > 0 &&
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-4 flex items-start gap-3">
          <TagIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            You can still save{' '}
            <strong>{formatCurrency(savableTotal)}</strong> in total by settling
            notices inside the AARTO 32-day discount window.
          </p>
        </div>
      }

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search reference, offence, or plate..."
            leftIcon={<SearchIcon className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1" />
          
          <Button
            variant="primary"
            className="flex-shrink-0 px-3"
            aria-label="Upload a fine photo"
            onClick={() => setIsUploadModalOpen(true)}>
            
            <CameraIcon className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {filters.map((filter) =>
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === filter.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
            
              {filter.label}
            </button>
          )}
        </div>
      </div>

      {vehicleFilter &&
      <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-sm font-medium text-blue-800 dark:text-blue-300">
            <CarIcon className="w-4 h-4" />
            Filtered to {vehicleFilter}
            <button
            onClick={() =>
            dispatch({
              type: 'SET_FINE_VEHICLE_FILTER',
              payload: null
            })
            }
            aria-label="Clear vehicle filter"
            className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors">
            
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      }

      {filteredFines.length === 0 ?
      <EmptyState
        icon={<FileTextIcon className="w-8 h-8" />}
        title="No fines found"
        description={
        searchQuery || statusFilter !== 'all' || vehicleFilter ?
        'Try adjusting your search or filters.' :
        "You don't have any traffic fines on record. Drive safe!"
        }
        actionLabel={vehicleFilter ? 'Clear vehicle filter' : undefined}
        onAction={
        vehicleFilter ?
        () =>
        dispatch({
          type: 'SET_FINE_VEHICLE_FILTER',
          payload: null
        }) :
        undefined
        } /> :


      <div className="space-y-4">
          {filteredFines.map((fine) =>
        <FineCard
          key={fine.id}
          fine={fine}
          onAnalyze={handleAnalyze}
          onPay={handlePay}
          onDispute={handleDispute}
          onViewDetail={handleViewDetail}
          onViewReceipt={handleViewReceipt} />

        )}
        </div>
      }

      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        fine={selectedFine} />
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fine={selectedFine} />
      
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)} />
      
    </motion.div>);

}