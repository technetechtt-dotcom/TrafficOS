import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import {
  DownloadIcon,
  TrashIcon,
  Edit3Icon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { DataRequest } from '../types';
export function DataRightsPage() {
  const { state, dispatch } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleRequest = (type: DataRequest['type']) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newRequest: DataRequest = {
        id: `req_${Math.random().toString(36).substr(2, 9)}`,
        type,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      dispatch({
        type: 'ADD_DATA_REQUEST',
        payload: newRequest
      });
      setIsSubmitting(false);
      if (type === 'export') {
        toast.success(
          'Data export requested. We will email you a secure link within 48 hours.'
        );
      } else if (type === 'deletion') {
        toast.success(
          'Account deletion requested. Our team will review this within 14 days.'
        );
      } else {
        toast.success(
          'Data correction requested. An agent will contact you shortly.'
        );
      }
    }, 1000);
  };
  const getStatusBadge = (status: DataRequest['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant="success"
            icon={<CheckCircleIcon className="w-3 h-3" />}>
            
            Completed
          </Badge>);

      case 'in_progress':
        return (
          <Badge variant="warning" icon={<ClockIcon className="w-3 h-3" />}>
            In Progress
          </Badge>);

      case 'rejected':
        return (
          <Badge variant="danger" icon={<XCircleIcon className="w-3 h-3" />}>
            Rejected
          </Badge>);

      default:
        return (
          <Badge variant="neutral" icon={<ClockIcon className="w-3 h-3" />}>
            Pending
          </Badge>);

    }
  };
  const getTypeLabel = (type: DataRequest['type']) => {
    switch (type) {
      case 'export':
        return 'Data Export';
      case 'deletion':
        return 'Account Deletion';
      case 'correction':
        return 'Data Correction';
    }
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
      className="max-w-4xl mx-auto space-y-8 pb-12">
      
      <PageHeader
        title="Data Rights & Requests"
        description="Under the Protection of Personal Information Act (POPIA), you have the right to access, correct, or delete your personal information. Submit your requests below." />
      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
            <DownloadIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Export Data
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
            Download a copy of all personal data associated with your account,
            including fine history and vehicle records.
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleRequest('export')}
            isLoading={isSubmitting}>
            
            Request Export
          </Button>
        </div>

        {/* Correction Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-4">
            <Edit3Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Correct Data
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
            Notice an error in your personal information or fine records?
            Request a correction from our team.
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleRequest('correction')}
            isLoading={isSubmitting}>
            
            Request Correction
          </Button>
        </div>

        {/* Deletion Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4">
            <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Delete Account
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="danger"
            className="w-full"
            onClick={() => handleRequest('deletion')}
            isLoading={isSubmitting}>
            
            Request Deletion
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Request History
        </h2>

        {state.dataRequests.length === 0 ?
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-800">
            <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              No requests yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your data requests will appear here.
            </p>
          </div> :

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {state.dataRequests.map((req) =>
            <div
              key={req.id}
              className="p-5 flex items-center justify-between">
              
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getTypeLabel(req.type)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Requested on{' '}
                      {new Date(req.requestedAt).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>
            )}
            </div>
          </div>
        }
      </div>
    </motion.div>);

}