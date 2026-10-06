import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PaymentRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  buildReceiptText,
  downloadTextFile,
  methodLabel } from
'../utils/payments';
import {
  ReceiptIcon,
  DownloadIcon,
  CreditCardIcon,
  IdCardIcon,
  TagIcon,
  ContactIcon } from
'lucide-react';
import { toast } from 'sonner';

type Filter = 'all' | 'fine' | 'licence-disc' | 'driver-licence';

export function PaymentsPage() {
  const { state } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const list =
    filter === 'all' ?
    state.payments :
    state.payments.filter((p) => p.purpose === filter);
    return [...list].sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    );
  }, [state.payments, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, PaymentRecord[]>();
    filtered.forEach((p) => {
      const key = new Intl.DateTimeFormat('en-ZA', {
        month: 'long',
        year: 'numeric'
      }).format(new Date(p.paidAt));
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totalPaid = state.payments.
  filter((p) => p.status === 'succeeded').
  reduce((sum, p) => sum + p.total, 0);
  const totalSaved = state.payments.reduce((sum, p) => sum + p.discount, 0);

  const handleDownload = (record: PaymentRecord) => {
    downloadTextFile(
      `Receipt_${record.receiptNumber}.txt`,
      buildReceiptText(record, state.user?.name ?? 'Account holder')
    );
    toast.success(`Receipt ${record.receiptNumber} downloaded`);
  };

  const filters: {
    label: string;
    value: Filter;
  }[] = [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'Fines',
    value: 'fine'
  },
  {
    label: 'Licence discs',
    value: 'licence-disc'
  },
  {
    label: "Driver's licence",
    value: 'driver-licence'
  }];


  const purposeMeta = {
    fine: {
      icon: <ReceiptIcon className="w-5 h-5" />,
      tone: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    },
    'licence-disc': {
      icon: <IdCardIcon className="w-5 h-5" />,
      tone: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    },
    'driver-licence': {
      icon: <ContactIcon className="w-5 h-5" />,
      tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
    }
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
        title="Payments & Receipts"
        description="Every payment you have made through TrafficOS, with proof of settlement you can download." />
      

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total settled
          </p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">
            {formatCurrency(totalPaid)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Across {state.payments.length}{' '}
            {state.payments.length === 1 ? 'payment' : 'payments'}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <TagIcon className="w-4 h-4" />
            <p className="text-xs font-medium uppercase tracking-wider">
              Saved on discounts
            </p>
          </div>
          <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mt-2 tracking-tight">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            By paying inside the 32-day window
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {filters.map((f) =>
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
          filter === f.value ?
          'bg-blue-600 text-white shadow-sm' :
          'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`
          }>
          
            {f.label}
          </button>
        )}
      </div>

      {grouped.length === 0 ?
      <EmptyState
        icon={<ReceiptIcon className="w-8 h-8" />}
        title="No payments yet"
        description={
        filter === 'all' ?
        'Once you pay a fine or renew a licence disc, your receipts will appear here.' :
        'No payments of this type yet. Try a different filter.'
        } /> :


      <div className="space-y-8">
          {grouped.map(([month, records]) =>
        <section key={month}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {month}
                </h2>
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  {formatCurrency(
                records.reduce((sum, r) => sum + r.total, 0)
              )}
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {records.map((record) => {
                const meta = purposeMeta[record.purpose];
                return (
                  <li
                    key={record.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    
                        <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.tone}`}>
                      
                          {meta.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {record.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatDate(record.paidAt)} ·{' '}
                            {methodLabel(record.method)} ·{' '}
                            {record.methodDetail}
                          </p>
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">
                            {record.receiptNumber}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(record.total)}
                            </p>
                            {record.discount > 0 &&
                        <Badge variant="success" size="sm">
                                Saved {formatCurrency(record.discount)}
                              </Badge>
                        }
                          </div>
                          <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<DownloadIcon className="w-4 h-4" />}
                        onClick={() => handleDownload(record)}>
                        
                            Receipt
                          </Button>
                        </div>
                      </li>);

              })}
                </ul>
              </div>
            </section>
        )}
        </div>
      }

      <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <CreditCardIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Receipts are issued electronically in terms of the Electronic
          Communications and Transactions Act 25 of 2002 and serve as valid
          proof of settlement. Keep them for at least five years for SARS
          purposes.
        </p>
      </div>
    </motion.div>);

}