import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, ExternalLinkIcon, CheckIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
export function PopiaConsentModal() {
  const { dispatch } = useAppStore();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const handleAccept = () => {
    dispatch({
      type: 'ACCEPT_POPIA',
      payload: {
        marketingConsent,
        analyticsConsent
      }
    });
    toast.success('Privacy preferences saved');
  };
  const handleDecline = () => {
    toast.error('You must accept POPIA terms to use TrafficOS');
    dispatch({
      type: 'LOGOUT'
    });
  };
  const handleViewPrivacy = () => {
    dispatch({
      type: 'SET_TAB',
      payload: 'privacy'
    });
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Privacy Matters
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Protection of Personal Information Act (POPIA) Compliance
            </p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              TrafficOS SA is committed to protecting your personal information
              in accordance with the{' '}
              <strong>
                Protection of Personal Information Act, Act 4 of 2013 (POPIA)
              </strong>
              .
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Data We Collect
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Identity:</strong> ID number, name, surname
                </li>
                <li>
                  <strong>Contact:</strong> Email address, phone number
                </li>
                <li>
                  <strong>Vehicle:</strong> Registration numbers, VIN,
                  make/model
                </li>
                <li>
                  <strong>Location:</strong> Fine locations, map interactions
                </li>
                <li>
                  <strong>Financial:</strong> Payment history (we do not store
                  card details)
                </li>
                <li>
                  <strong>Behavioural:</strong> Driving patterns for risk
                  scoring
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Your Rights (Sections 23-25)
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access to your personal information</li>
                <li>Correction or deletion of your data</li>
                <li>Objection to processing</li>
                <li>Data portability</li>
                <li>
                  Right to lodge a complaint with the Information Regulator
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Your Preferences
            </h3>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Essential Processing
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Required for fine management, payments, and AARTO sync. Cannot
                  be disabled.
                </p>
              </div>
              <div className="w-12 h-6 rounded-full bg-blue-600 relative opacity-50 cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 translate-x-7 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Analytics & Risk Scoring
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allows us to analyze your driving patterns to provide AI
                  insights and risk scores. Opting out limits functionality.
                </p>
              </div>
              <button
                onClick={() => setAnalyticsConsent(!analyticsConsent)}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${analyticsConsent ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${analyticsConsent ? 'translate-x-7' : 'translate-x-1'}`} />
                
              </button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Marketing Communications
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive promotional offers, partner discounts, and driving
                  tips.
                </p>
              </div>
              <button
                onClick={() => setMarketingConsent(!marketingConsent)}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${marketingConsent ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${marketingConsent ? 'translate-x-7' : 'translate-x-1'}`} />
                
              </button>
            </div>
          </div>

          <div className="pt-4 text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p>Information Officer: privacy@trafficos.co.za</p>
            <button
              onClick={handleViewPrivacy}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium">
              
              Read Full Privacy Policy <ExternalLinkIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="ghost" onClick={handleDecline}>
            Decline & Logout
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Accept & Continue
          </Button>
        </div>
      </motion.div>
    </div>);

}