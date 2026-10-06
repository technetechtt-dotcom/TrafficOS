import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { TabType } from '../../types';
import {
  HomeIcon,
  FileTextIcon,
  CarIcon,
  MapPinIcon,
  MenuIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { MoreSheet } from './MoreSheet';

/** Tabs that should highlight the "More" entry while active. */
const MORE_TABS: TabType[] = [
'disputes',
'aarto-points',
'licenses',
'driver-licence',
'payments',
'documents',
'analytics',
'profile',
'notifications',
'settings',
'privacy',
'data-rights',
'support'];


export function BottomNav() {
  const { state, dispatch } = useAppStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
  }[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: <HomeIcon className="w-6 h-6" />
  },
  {
    id: 'fines',
    label: 'Fines',
    icon: <FileTextIcon className="w-6 h-6" />
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: <CarIcon className="w-6 h-6" />
  },
  {
    id: 'map',
    label: 'Map',
    icon: <MapPinIcon className="w-6 h-6" />
  }];


  // Don't show bottom nav on the dispute editor to maximise screen real estate
  if (state.activeTab === 'dispute') return null;

  const isMoreActive = MORE_TABS.includes(state.activeTab);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = state.activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                dispatch({
                  type: 'SET_TAB',
                  payload: item.id
                })
                }
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                
                {isActive &&
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }} />

                }
                <div
                  className={`${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  
                  {item.label}
                </span>
              </button>);

          })}

          <button
            onClick={() => setIsMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isMoreOpen}
            className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            
            {isMoreActive &&
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }} />

            }
            <div
              className={isMoreActive ? 'text-blue-600 dark:text-blue-400' : ''}>
              
              <MenuIcon className="w-6 h-6" />
            </div>
            <span
              className={`text-[10px] font-medium ${isMoreActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              
              More
            </span>
          </button>
        </div>
      </nav>

      <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>);

}