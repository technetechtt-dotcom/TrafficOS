import React, { useEffect, useState, createElement } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { Button } from '../components/ui/Button';
import { DisputeTimeline } from '../components/dispute/DisputeTimeline';
import { BlockchainReceipt } from '../components/dispute/BlockchainReceipt';
import { VoiceDisputeButton } from '../components/voice/VoiceDisputeButton';
import { PageHeader } from '../components/layout/PageHeader';
import { DownloadIcon, SendIcon, CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
export function DisputePage() {
  const { state, dispatch } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fine = state.fines.find((f) => f.id === state.activeFineId);
  const existingDispute = state.disputes.find((d) => d.fineId === fine?.id);
  const user = state.user;
  const initialLegalText =
  fine && user ?
  `REPRESENTATION IN TERMS OF SECTION 18 OF THE ADMINISTRATIVE ADJUDICATION OF ROAD TRAFFIC OFFENCES (AARTO) ACT, 1998 (ACT NO. 46 OF 1998)

TO: The Issuing Authority (${fine.issuedBy})
REFERENCE NUMBER: ${fine.referenceNumber}

I, the undersigned,
${user.name}
ID Number: ${user.idNumber}
Contact: ${user.phone}

Hereby submit a representation regarding the infringement notice issued for vehicle ${fine.licensePlate} on ${new Date(fine.issuedDate).toLocaleDateString('en-ZA')}.

GROUNDS FOR DISPUTE:
1. Procedural Irregularity: The infringement notice was not served in accordance with the prescribed requirements of Section 17 of the AARTO Act.
2. Evidentiary Deficiencies: The photographic evidence provided does not conclusively identify the vehicle or the driver at the time of the alleged offence.
3. Equipment Calibration: I request the calibration certificate for the speed measuring equipment used, as required by the TCSP guidelines.

I respectfully request that this infringement notice be cancelled based on the aforementioned grounds.

Signed at __________________ on this _____ day of ________________ 20___.

_______________________
Signature` :
  '';
  const [legalText, setLegalText] = useState(initialLegalText);
  useEffect(() => {
    // Scroll to top when entering dispute page
    window.scrollTo(0, 0);
    // If already disputed, show success state immediately
    if (existingDispute) {
      setIsSuccess(true);
    }
  }, [existingDispute]);
  if (!fine) {
    return (
      <div className="text-center py-12">
        <p>Fine not found. Please return to the fines list.</p>
        <Button
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'fines'
          })
          }
          className="mt-4">
          
          Back to Fines
        </Button>
      </div>);

  }
  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Generate simple hash
      const hash = Array.from(crypto.getRandomValues(new Uint8Array(32))).
      map((b) => b.toString(16).padStart(2, '0')).
      join('');
      const newDispute = {
        disputeId: `disp_${Date.now()}`,
        fineId: fine.id,
        currentStage: 'submitted' as const,
        blockchainHash: hash,
        submittedAt: new Date().toISOString(),
        events: [
        {
          id: `evt_${Date.now()}`,
          stage: 'submitted' as const,
          title: 'Dispute Submitted',
          description: 'Representation securely lodged via TrafficOS.',
          timestamp: new Date().toISOString(),
          isComplete: true
        }]

      };
      dispatch({
        type: 'ADD_DISPUTE',
        payload: newDispute
      });
      dispatch({
        type: 'UPDATE_FINE_STATUS',
        payload: {
          id: fine.id,
          status: 'disputed'
        }
      });
      toast.success('Dispute submitted successfully');
    }, 2000);
  };
  const handleDownload = () => {
    const blob = new Blob([legalText], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dispute_${fine.referenceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };
  const handleVoiceTranscript = (text: string) => {
    setLegalText((prev) => prev + '\n\nADDITIONAL NOTES:\n' + text);
    toast.success('Voice notes added to document');
  };
  if (isSuccess && existingDispute) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        className="max-w-3xl mx-auto space-y-6">
        
        <PageHeader title="Your Representation" backLabel="Back to Fines" />

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dispute Active
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ref: {fine.referenceNumber}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
              dispatch({
                type: 'SET_TAB',
                payload: 'disputes'
              })
              }
              className="flex-shrink-0">
              
              All disputes
            </Button>
          </div>

          <div className="mb-8">
            <BlockchainReceipt
              hash={existingDispute.blockchainHash || ''}
              timestamp={existingDispute.submittedAt} />
            
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Lifecycle Tracking
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <DisputeTimeline lifecycle={existingDispute} />
          </div>
        </div>
      </motion.div>);

  }
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
      className="max-w-3xl mx-auto space-y-6">
      
      <PageHeader
        title="Generate Legal Dispute"
        description="Review and edit the AI-generated legal representation before submission."
        backLabel="Back to Fines" />
      

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Reference: {fine.referenceNumber}
          </span>
          <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
            R {fine.amount}
          </span>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {fine.offenceType} - {fine.licensePlate}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[500px]">
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AARTO Representation Document
          </span>
          <div className="flex items-center gap-2">
            <VoiceDisputeButton onTranscript={handleVoiceTranscript} />
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<DownloadIcon className="w-4 h-4" />}
              onClick={handleDownload}>
              
              PDF
            </Button>
          </div>
        </div>
        <textarea
          className="flex-1 w-full p-6 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
          value={legalText}
          onChange={(e) => setLegalText(e.target.value)}
          spellCheck={false} />
        
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() =>
          dispatch({
            type: 'SET_TAB',
            payload: 'fines'
          })
          }>
          
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          leftIcon={<SendIcon className="w-4 h-4" />}
          isLoading={isSubmitting}
          onClick={handleSubmit}>
          
          Submit Dispute
        </Button>
      </div>
    </motion.div>);

}