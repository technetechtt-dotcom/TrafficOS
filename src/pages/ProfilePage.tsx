import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { RiskScoreCard } from '../components/cards/RiskScoreCard';
import { maskIdNumber } from '../utils/formatters';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  HashIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  ShieldIcon,
  SettingsIcon,
  HelpCircleIcon,
  BellIcon,
  ChevronRightIcon,
  ShieldAlertIcon,
  LockIcon,
  ScaleIcon,
  CreditCardIcon,
  ContactIcon } from
'lucide-react';
export function ProfilePage() {
  const { state, dispatch } = useAppStore();
  const user = state.user;
  if (!user) return null;
  const handleLogout = () => {
    dispatch({
      type: 'LOGOUT'
    });
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="max-w-2xl mx-auto space-y-8">
      
      <PageHeader
        title="Profile"
        description="Manage your personal information and jump to everything on your account." />
      

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Verified AARTO User
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="flex items-center text-gray-900 dark:text-white font-medium">
                <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                {user.email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="flex items-center text-gray-900 dark:text-white font-medium">
                <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                {user.phone}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                SA ID Number
              </label>
              <div className="flex items-center text-gray-900 dark:text-white font-medium">
                <HashIcon className="w-4 h-4 mr-2 text-gray-400" />
                {maskIdNumber(user.idNumber)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Risk Profile
        </h3>
        <RiskScoreCard profile={state.riskProfile} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <ProfileLink
            icon={<ShieldAlertIcon className="w-5 h-5" />}
            label="AARTO Demerit Points"
            description="View your points status and history"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'aarto-points'
            })
            } />
          
          <ProfileLink
            icon={<ScaleIcon className="w-5 h-5" />}
            label="My Disputes"
            description={`${
            state.disputes.filter(
              (d) =>
              d.currentStage !== 'resolved' &&
              d.currentStage !== 'dismissed'
            ).length} active representations`
            }
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'disputes'
            })
            } />
          
          <ProfileLink
            icon={<CreditCardIcon className="w-5 h-5" />}
            label="Payments & Receipts"
            description="Every payment with downloadable proof"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'payments'
            })
            } />
          
          <ProfileLink
            icon={<ContactIcon className="w-5 h-5" />}
            label="Driver's Licence"
            description="Card status and renewal bookings"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'driver-licence'
            })
            } />
          
          <ProfileLink
            icon={<LockIcon className="w-5 h-5" />}
            label="Secure Document Vault"
            description="Manage your ID and vehicle papers"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'documents'
            })
            } />
          
          <ProfileLink
            icon={<SettingsIcon className="w-5 h-5" />}
            label="Settings"
            description="Notifications, language, security"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'settings'
            })
            } />
          
          <ProfileLink
            icon={<BellIcon className="w-5 h-5" />}
            label="Notifications"
            description={`${state.notifications.filter((n) => !n.read).length} unread`}
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'notifications'
            })
            } />
          
          <ProfileLink
            icon={<HelpCircleIcon className="w-5 h-5" />}
            label="Support Center"
            description="FAQs, contact us, legal resources"
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'support'
            })
            } />
          
          <button
            onClick={() =>
            dispatch({
              type: 'TOGGLE_DARK_MODE'
            })
            }
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-gray-400">
                {state.isDarkMode ?
                <MoonIcon className="w-5 h-5" /> :

                <SunIcon className="w-5 h-5" />
                }
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Toggle dark appearance
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${state.isDarkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
              
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${state.isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
              
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-4 pb-8 space-y-4">
        <Button
          variant="danger"
          leftIcon={<LogOutIcon className="w-4 h-4" />}
          onClick={handleLogout}
          className="w-full sm:w-auto">
          
          Sign Out Securely
        </Button>
        <div className="text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center">
            <ShieldIcon className="w-3 h-3 mr-1" /> TrafficOS SA v1.0.0
          </p>
        </div>
      </div>
    </motion.div>);

}
function ProfileLink({
  icon,
  label,
  description,
  onClick





}: {icon: React.ReactNode;label: string;description: string;onClick: () => void;}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-gray-400">{icon}</div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>);

}