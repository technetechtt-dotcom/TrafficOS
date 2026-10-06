import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AIResultCard } from '../cards/AIResultCard';
import { Fine, AIAnalysis } from '../../types';
import { mockAIAnalyses } from '../../data/mockData';
import { LoaderIcon, SparklesIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: Fine | null;
}
export function AIAnalysisModal({
  isOpen,
  onClose,
  fine
}: AIAnalysisModalProps) {
  const { dispatch } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  useEffect(() => {
    if (isOpen && fine) {
      setIsAnalyzing(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const result = mockAIAnalyses[fine.id] || {
          fineId: fine.id,
          successProbability: 50,
          recommendation: 'pay',
          reasons: [
          'Standard fine processing',
          'No obvious procedural errors found'],

          estimatedSavings: 0,
          riskLevel: 'medium'
        };
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fine]);
  const handleGenerateDispute = () => {
    if (fine) {
      dispatch({
        type: 'SET_ACTIVE_FINE',
        payload: fine.id
      });
      dispatch({
        type: 'SET_TAB',
        payload: 'dispute'
      });
      onClose();
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Legal Analysis"
      maxWidth="md">
      
      {isAnalyzing ?
      <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <SparklesIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analyzing Fine Details...
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Cross-referencing AARTO regulations, camera calibration records, and
            procedural requirements.
          </p>
        </div> :
      analysis ?
      <div className="space-y-6">
          <AIResultCard analysis={analysis} />

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Close
            </Button>
            {analysis.recommendation === 'dispute' &&
          <Button
            variant="primary"
            onClick={handleGenerateDispute}
            className="flex-1">
            
                Generate Dispute
              </Button>
          }
          </div>
        </div> :
      null}
    </Modal>);

}