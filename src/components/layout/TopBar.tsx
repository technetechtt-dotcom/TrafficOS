import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { BellIcon, SunIcon, MoonIcon, ShieldIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function TopBar() {
  const { state, dispatch } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = state.notifications.filter((n) => !n.read).length;
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <ShieldIcon className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">
          TrafficOS <span className="text-blue-600">SA</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() =>
          dispatch({
            type: 'TOGGLE_DARK_MODE'
          })
          }
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode">
          
          {state.isDarkMode ?
          <SunIcon className="w-5 h-5" /> :

          <MoonIcon className="w-5 h-5" />
          }
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 &&
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            }
          </button>

          <AnimatePresence>
            {showNotifications &&
            <>
                <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)} />
              
                <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 &&
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: 'MARK_ALL_NOTIFICATIONS_READ'
                      });
                    }}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    
                        Mark all read
                      </button>
                  }
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {state.notifications.length === 0 ?
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No notifications
                      </div> :

                  state.notifications.slice(0, 5).map((notif) =>
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => {
                      dispatch({
                        type: 'MARK_NOTIFICATION_READ',
                        payload: notif.id
                      });
                    }}>
                    
                          <div className="flex justify-between items-start mb-1">
                            <h4
                        className={`text-sm font-medium ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        
                              {notif.title}
                            </h4>
                            {!notif.read &&
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                      }
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                  )
                  }
                  </div>
                  {state.notifications.length > 0 &&
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    dispatch({
                      type: 'SET_TAB',
                      payload: 'notifications'
                    });
                  }}
                  className="w-full p-3 border-t border-gray-100 dark:border-gray-800 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  
                      View all notifications
                    </button>
                }
                </motion.div>
              </>
            }
          </AnimatePresence>
        </div>

        <div
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer border border-gray-300 dark:border-gray-700"
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'profile'
          })
          }>
          
          {state.user?.name.charAt(0) || 'U'}
        </div>
      </div>
    </header>);

}