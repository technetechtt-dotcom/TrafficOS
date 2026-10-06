import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Notification } from '../types';
import { formatDate } from '../utils/formatters';
import {
  BellIcon,
  CheckIcon,
  FileTextIcon,
  ClockIcon,
  ScaleIcon,
  CreditCardIcon,
  ContactIcon,
  ChevronRightIcon } from
'lucide-react';

type NotifFilter = 'all' | 'unread' | Notification['type'];

export function NotificationsPage() {
  const { state, dispatch } = useAppStore();
  const [filter, setFilter] = useState<NotifFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return state.notifications;
    if (filter === 'unread') return state.notifications.filter((n) => !n.read);
    return state.notifications.filter((n) => n.type === filter);
  }, [state.notifications, filter]);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  /** Marks read and, where the notification relates to an entity, navigates to it. */
  const handleOpen = (notif: Notification) => {
    dispatch({
      type: 'MARK_NOTIFICATION_READ',
      payload: notif.id
    });

    if (notif.fineId) {
      dispatch({
        type: 'SET_ACTIVE_FINE',
        payload: notif.fineId
      });
    }
    if (notif.linkTab) {
      dispatch({
        type: 'SET_TAB',
        payload: notif.linkTab
      });
    }
  };

  const filters: {
    label: string;
    value: NotifFilter;
    count?: number;
  }[] = [
  {
    label: 'All',
    value: 'all',
    count: state.notifications.length
  },
  {
    label: 'Unread',
    value: 'unread',
    count: unreadCount
  },
  {
    label: 'Fines',
    value: 'fine'
  },
  {
    label: 'Disputes',
    value: 'dispute'
  },
  {
    label: 'Payments',
    value: 'payment'
  },
  {
    label: 'Deadlines',
    value: 'deadline'
  },
  {
    label: 'Licences',
    value: 'licence'
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
        title="Notifications"
        description="All updates about your fines, disputes, payments and licences."
        actions={
        unreadCount > 0 ?
        <Button
          variant="secondary"
          leftIcon={<CheckIcon className="w-4 h-4" />}
          onClick={() =>
          dispatch({
            type: 'MARK_ALL_NOTIFICATIONS_READ'
          })
          }>
          
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </Button> :
        undefined
        } />
      

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {filters.map((f) =>
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filter === f.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          
            {f.label}
            {f.count !== undefined && f.count > 0 &&
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
        icon={<BellIcon className="w-8 h-8" />}
        title="No notifications"
        description={
        filter === 'unread' ? "You're all caught up." : 'Nothing here yet.'
        } /> :


      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((n) =>
          <li key={n.id}>
                <NotificationRow notif={n} onClick={() => handleOpen(n)} />
              </li>
          )}
          </ul>
        </div>
      }
    </motion.div>);

}

function NotificationRow({
  notif,
  onClick



}: {notif: Notification;onClick: () => void;}) {
  const typeMeta = {
    fine: {
      icon: <FileTextIcon className="w-5 h-5" />,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    },
    deadline: {
      icon: <ClockIcon className="w-5 h-5" />,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20'
    },
    dispute: {
      icon: <ScaleIcon className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    },
    payment: {
      icon: <CreditCardIcon className="w-5 h-5" />,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
    },
    licence: {
      icon: <ContactIcon className="w-5 h-5" />,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
    }
  };
  const meta = typeMeta[notif.type];
  const isLinked = Boolean(notif.linkTab);

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notif.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
      
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
        
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-3 mb-1">
          <h4
            className={`text-sm ${!notif.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
            
            {notif.title}
          </h4>
          {!notif.read &&
          <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
          }
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {notif.message}
        </p>
        <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
      </div>
      {isLinked &&
      <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-2.5" />
      }
    </button>);

}