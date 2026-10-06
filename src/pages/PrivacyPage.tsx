import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { ShieldCheckIcon, MailIcon } from 'lucide-react';
export function PrivacyPage() {
  const { dispatch } = useAppStore();
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
      className="max-w-3xl mx-auto space-y-8 pb-12">
      
      <PageHeader title="Privacy Policy" />

      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            Protection of Personal Information Act, 4 of 2013
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Last updated: 12 May 2026 · POPIA compliant
          </p>
        </div>
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            1. Introduction
          </h2>
          <p>
            TrafficOS SA ("we", "us", or "our") respects your privacy and is
            committed to protecting your personal information. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our web application, in compliance with the
            Protection of Personal Information Act, Act 4 of 2013 (POPIA).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2. Information We Collect
          </h2>
          <p>
            We collect personal information that you voluntarily provide to us
            when registering and using TrafficOS. This includes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Identity Data:</strong> First name, last name, South
              African ID number.
            </li>
            <li>
              <strong>Contact Data:</strong> Email address, telephone numbers.
            </li>
            <li>
              <strong>Vehicle Data:</strong> License plate numbers, VIN, vehicle
              make and model.
            </li>
            <li>
              <strong>Financial Data:</strong> Transaction history for fine
              payments and license renewals (we use secure third-party payment
              gateways and do not store raw credit card details).
            </li>
            <li>
              <strong>Location Data:</strong> Geolocation data associated with
              traffic fines.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            3. How We Use Your Information
          </h2>
          <p>We use the personal information collected to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, operate, and maintain our platform.</li>
            <li>Process traffic fine payments and license disc renewals.</li>
            <li>Sync with AARTO and municipal traffic databases.</li>
            <li>
              Generate AI-driven insights and risk profiles (if consent is
              provided).
            </li>
            <li>
              Send administrative information, such as updates to terms and
              policies.
            </li>
            <li>Respond to customer service requests and support needs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            4. Disclosure of Your Information
          </h2>
          <p>
            We may share your information with third parties only in the ways
            that are described in this Privacy Policy:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Government Authorities:</strong> To facilitate fine
              payments and license renewals (e.g., AARTO, RTMC, local
              municipalities).
            </li>
            <li>
              <strong>Service Providers:</strong> Third-party vendors that
              perform services for us or on our behalf (payment processing, data
              analysis, email delivery).
            </li>
            <li>
              <strong>Legal Obligations:</strong> When required by law,
              subpoena, or other legal processes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            5. Data Security
          </h2>
          <p>
            We implement reasonable technical and organizational security
            measures to protect your personal information from unauthorized
            access, use, alteration, and disclosure. However, no electronic
            transmission over the internet or information storage technology can
            be guaranteed to be 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Your Data Rights (POPIA)
          </h2>
          <p>Under POPIA, you have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Request access to your personal information.</li>
            <li>
              Request correction or deletion of your personal information.
            </li>
            <li>Object to the processing of your personal information.</li>
            <li>
              Request restriction of processing your personal information.
            </li>
            <li>Request transfer of your personal information.</li>
            <li>Withdraw consent at any time.</li>
          </ul>
          <p className="mt-4">
            You can exercise these rights by visiting the{' '}
            <button
              onClick={() =>
              dispatch({
                type: 'SET_TAB',
                payload: 'data-rights'
              })
              }
              className="text-blue-600 dark:text-blue-400 hover:underline">
              
              Data Rights
            </button>{' '}
            section in your settings.
          </p>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MailIcon className="w-5 h-5" /> Contact Our Information Officer
          </h2>
          <p className="text-sm">
            If you have questions or comments about this Privacy Policy, please
            contact our Information Officer at:
          </p>
          <div className="mt-3 text-sm font-medium">
            <p>Email: privacy@trafficos.co.za</p>
            <p>Address: 123 Innovation Drive, Sandton, Johannesburg, 2196</p>
            <p>Phone: +27 (0) 11 555 0123</p>
          </div>
        </section>
      </div>
    </motion.div>);

}