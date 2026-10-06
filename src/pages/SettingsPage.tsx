import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { UserPreferences } from '../types';
import { formatDate } from '../utils/formatters';
import {
  BellIcon,
  GlobeIcon,
  LockIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  ChevronRightIcon,
  TrashIcon,
  ShieldCheckIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CreditCardIcon } from
'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { state, dispatch } = useAppStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const prefs = state.preferences;

  const setPref = (key: keyof UserPreferences, value: boolean | string) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: {
        [key]: value
      } as Partial<UserPreferences>
    });
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setTimeout(() => {
      dispatch({
        type: 'ADD_DATA_REQUEST',
        payload: {
          id: `req_${Date.now()}`,
          type: 'deletion',
          status: 'pending',
          requestedAt: new Date().toISOString(),
          reason: 'Account deletion requested from Settings'
        }
      });
      setIsDeleting(false);
      setIsDeleteOpen(false);
      dispatch({
        type: 'DELETE_ACCOUNT'
      });
      toast.success(
        'Account closed. Your deletion request has been logged under POPIA.'
      );
    }, 1600);
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
      className="max-w-2xl mx-auto space-y-6">
      
      <PageHeader
        title="Settings"
        description="Control your alerts, language, security and privacy." />
      

      <SettingsSection
        title="Notifications"
        icon={<BellIcon className="w-5 h-5" />}>
        
        <ToggleRow
          label="New fines"
          description="Alerts when a new fine is linked to your vehicles"
          checked={prefs.pushFines}
          onChange={() => setPref('pushFines', !prefs.pushFines)} />
        
        <ToggleRow
          label="Payment deadlines"
          description="Reminders before due dates and before the discount window closes"
          checked={prefs.pushDeadlines}
          onChange={() => setPref('pushDeadlines', !prefs.pushDeadlines)} />
        
        <ToggleRow
          label="Dispute updates"
          description="Status changes on your active representations"
          checked={prefs.pushDisputes}
          onChange={() => setPref('pushDisputes', !prefs.pushDisputes)} />
        
        <ToggleRow
          label="Email receipts"
          description="Send proof of payment to your email as well"
          checked={prefs.emailReceipts}
          onChange={() => setPref('emailReceipts', !prefs.emailReceipts)} />
        
        <ToggleRow
          label="Tips & product updates"
          description="Occasional product news and driving tips"
          checked={prefs.pushMarketing}
          onChange={() => {
            setPref('pushMarketing', !prefs.pushMarketing);
            dispatch({
              type: 'ACCEPT_POPIA',
              payload: {
                marketingConsent: !prefs.pushMarketing,
                analyticsConsent: state.popiaConsent.analyticsConsent
              }
            });
          }} />
        
      </SettingsSection>

      <SettingsSection
        title="Appearance"
        icon={
        state.isDarkMode ?
        <MoonIcon className="w-5 h-5" /> :

        <SunIcon className="w-5 h-5" />

        }>
        
        <ToggleRow
          label="Dark mode"
          description="Easier on the eyes in low light"
          checked={state.isDarkMode}
          onChange={() =>
          dispatch({
            type: 'TOGGLE_DARK_MODE'
          })
          } />
        
      </SettingsSection>

      <SettingsSection
        title="Language & Region"
        icon={<GlobeIcon className="w-5 h-5" />}>
        
        <div className="px-5 py-4">
          <label
            htmlFor="language"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            
            Display Language
          </label>
          <select
            id="language"
            value={prefs.language}
            onChange={(e) => {
              setPref('language', e.target.value);
              toast.success('Language preference saved');
            }}
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px] px-4">
            
            <option value="en-ZA">English (South Africa)</option>
            <option value="af-ZA">Afrikaans</option>
            <option value="zu-ZA">isiZulu</option>
            <option value="xh-ZA">isiXhosa</option>
            <option value="st-ZA">Sesotho</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Legal documents such as AARTO representations remain in English, as
            required by the issuing authorities.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Security" icon={<LockIcon className="w-5 h-5" />}>
        <ToggleRow
          label="Biometric sign-in"
          description="Use Face ID or fingerprint to log in"
          checked={prefs.biometric}
          onChange={() => setPref('biometric', !prefs.biometric)} />
        
        <ActionRow
          label="Change password"
          description="Last changed 3 months ago"
          icon={<LockIcon className="w-4 h-4" />}
          onClick={() => {
            dispatch({
              type: 'SET_TAB',
              payload: 'forgot-password'
            });
            dispatch({
              type: 'LOGOUT'
            });
            toast.info('Sign in again to set a new password');
          }} />
        
        <ActionRow
          label="Payment methods"
          description="Cards and bank accounts on file"
          icon={<CreditCardIcon className="w-4 h-4" />}
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'payments'
          })
          } />
        
      </SettingsSection>

      <SettingsSection
        title="Privacy & POPIA"
        icon={<ShieldCheckIcon className="w-5 h-5" />}>
        
        <ToggleRow
          label="Analytics & risk scoring"
          description="Allows AI insights and your risk profile. Turning this off limits those features."
          checked={state.popiaConsent.analyticsConsent}
          onChange={() => {
            dispatch({
              type: 'ACCEPT_POPIA',
              payload: {
                marketingConsent: state.popiaConsent.marketingConsent,
                analyticsConsent: !state.popiaConsent.analyticsConsent
              }
            });
            toast.success('Privacy preferences updated');
          }} />
        
        <ActionRow
          label="Privacy policy"
          description="How we collect, use and protect your information"
          icon={<FileTextIcon className="w-4 h-4" />}
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'privacy'
          })
          } />
        
        <ActionRow
          label="Data rights & requests"
          description="Export, correct or delete your personal information"
          icon={<EyeIcon className="w-4 h-4" />}
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'data-rights'
          })
          } />
        
        <div className="px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              POPIA consent
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {state.popiaConsent.acceptedAt ?
              `Accepted on ${formatDate(state.popiaConsent.acceptedAt)}` :
              'Not yet accepted'}
            </p>
          </div>
          <button
            onClick={() => {
              dispatch({
                type: 'REVOKE_POPIA'
              });
              toast.info('Consent withdrawn — you will be asked again');
            }}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex-shrink-0">
            
            Withdraw
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Account"
        icon={<TrashIcon className="w-5 h-5" />}
        danger>
        
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Close your account and request erasure of your personal
            information. Fine and payment records must be retained for five
            years to meet SARS and municipal requirements, so those are
            anonymised rather than deleted.
          </p>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<TrashIcon className="w-4 h-4" />}
            onClick={() => setIsDeleteOpen(true)}>
            
            Delete Account
          </Button>
        </div>
      </SettingsSection>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete your account"
        maxWidth="md">
        
        <div className="space-y-5">
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <AlertTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300 space-y-1.5">
              <p className="font-semibold">This cannot be undone.</p>
              <p>
                You have{' '}
                {
                state.fines.filter(
                  (f) => f.status === 'pending' || f.status === 'overdue'
                ).length
                }{' '}
                unpaid fines. Deleting your account does not cancel them — the
                issuing authorities will continue to pursue payment.
              </p>
            </div>
          </div>

          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>· Your vehicles, documents and disputes are removed</li>
            <li>· Active disputes are withdrawn and cannot be reinstated</li>
            <li>
              · Payment records are retained for five years in anonymised form
            </li>
            <li>· A POPIA deletion request is logged on your behalf</li>
          </ul>

          <div>
            <label
              htmlFor="delete-confirm"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              
              Type <span className="font-mono font-semibold">DELETE</span> to
              confirm
            </label>
            <input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px] px-4" />
            
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsDeleteOpen(false)}>
              
              Keep my account
            </Button>
            <Button
              variant="danger"
              fullWidth
              disabled={deleteConfirm !== 'DELETE'}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}>
              
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>);

}

function SettingsSection({
  title,
  icon,
  children,
  danger





}: {title: string;icon: React.ReactNode;children: React.ReactNode;danger?: boolean;}) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <span className={danger ? 'text-red-500' : 'text-gray-400'}>
          {icon}
        </span>
        <h2
          className={`font-semibold ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          
          {title}
        </h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {children}
      </div>
    </section>);

}

function ToggleRow({
  label,
  description,
  checked,
  onChange





}: {label: string;description: string;checked: boolean;onChange: () => void;}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}>
        
        <span
          className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
        
      </button>
    </div>);

}

function ActionRow({
  label,
  description,
  icon,
  onClick





}: {label: string;description: string;icon: React.ReactNode;onClick: () => void;}) {
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