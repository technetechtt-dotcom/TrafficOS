import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import { TabType } from '../../types';
import {
  XIcon,
  BarChart3Icon,
  IdCardIcon,
  CreditCardIcon,
  ScaleIcon,
  GaugeIcon,
  FolderLockIcon,
  BellIcon,
  SettingsIcon,
  HelpCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  LogOutIcon,
  ContactIcon,
  ChevronRightIcon } from
'lucide-react';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MoreItem {
  id: TabType;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: number;
}

/**
 * Mobile destination menu. The bottom nav only has room for four primary
 * destinations, so every other page in the product is reachable from here —
 * mobile has full parity with the desktop sidebar.
 */
export function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const { state, dispatch } = useAppStore();
  const unread = state.notifications.filter((n) => !n.read).length;

  const go = (tab: TabType) => {
    dispatch({
      type: 'SET_TAB',
      payload: tab
    });
    onClose();
  };

  const groups: {
    heading: string;
    items: MoreItem[];
  }[] = [
  {
    heading: 'Manage',
    items: [
    {
      id: 'disputes',
      label: 'My Disputes',
      description: 'Track every representation you have lodged',
      icon: <ScaleIcon className="w-5 h-5" />
    },
    {
      id: 'aarto-points',
      label: 'Demerit Points',
      description: 'Your AARTO points and suspension risk',
      icon: <GaugeIcon className="w-5 h-5" />
    },
    {
      id: 'licenses',
      label: 'Licence Discs',
      description: 'Renew and pay for vehicle discs',
      icon: <IdCardIcon className="w-5 h-5" />
    },
    {
      id: 'driver-licence',
      label: "Driver's Licence",
      description: 'Card status and renewal bookings',
      icon: <ContactIcon className="w-5 h-5" />
    }]

  },
  {
    heading: 'Records',
    items: [
    {
      id: 'payments',
      label: 'Payments & Receipts',
      description: 'Every payment with downloadable proof',
      icon: <CreditCardIcon className="w-5 h-5" />
    },
    {
      id: 'documents',
      label: 'Document Vault',
      description: 'ID, licence and vehicle paperwork',
      icon: <FolderLockIcon className="w-5 h-5" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Spending trends and fine history',
      icon: <BarChart3Icon className="w-5 h-5" />
    }]

  },
  {
    heading: 'Account',
    items: [
    {
      id: 'profile',
      label: 'Profile',
      description: 'Your personal details',
      icon: <UserIcon className="w-5 h-5" />
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: unread > 0 ? `${unread} unread` : 'All caught up',
      icon: <BellIcon className="w-5 h-5" />,
      badge: unread
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Alerts, language and security',
      icon: <SettingsIcon className="w-5 h-5" />
    },
    {
      id: 'privacy',
      label: 'Privacy & POPIA',
      description: 'Policy and your data rights',
      icon: <ShieldCheckIcon className="w-5 h-5" />
    },
    {
      id: 'support',
      label: 'Support Centre',
      description: 'FAQs, live chat and legal resources',
      icon: <HelpCircleIcon className="w-5 h-5" />
    }]

  }];


  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.2,
            ease: [0.23, 1, 0.32, 1]
          }}
          onClick={onClose}
          className="md:hidden fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm" />
        
          <motion.div
          role="dialog"
          aria-label="All destinations"
          initial={{
            y: '100%'
          }}
          animate={{
            y: 0
          }}
          exit={{
            y: '100%'
          }}
          transition={{
            duration: 0.28,
            ease: [0.23, 1, 0.32, 1]
          }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl">
          
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                  {state.user?.name.charAt(0) ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {state.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {state.user?.email}
                  </p>
                </div>
              </div>
              <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-3 py-4 space-y-6">
              {groups.map((group) =>
            <div key={group.heading}>
                  <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {group.heading}
                  </h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) =>
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  
                        <span className="text-gray-400 flex-shrink-0">
                          {item.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium text-gray-900 dark:text-white text-sm">
                            {item.label}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.description}
                          </span>
                        </span>
                        {item.badge && item.badge > 0 ?
                  <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold flex items-center justify-center">
                            {item.badge}
                          </span> :

                  <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  }
                      </button>
                )}
                  </div>
                </div>
            )}

              <div className="px-3 pt-2 pb-4">
                <button
                onClick={() => {
                  onClose();
                  dispatch({
                    type: 'LOGOUT'
                  });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                
                  <LogOutIcon className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}