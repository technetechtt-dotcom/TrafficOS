import React from 'react';
import { AIAnalysis } from '../../types';
import { Badge } from '../ui/Badge';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
interface AIResultCardProps {
  analysis: AIAnalysis;
}
export function AIResultCard({ analysis }: AIResultCardProps) {
  const isDispute = analysis.recommendation === 'dispute';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div
        className={`p-6 text-center ${isDispute ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-amber-50 dark:bg-amber-900/10'}`}>
        
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          AI Recommendation
        </h4>

        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3" />
            
            <path
              className={isDispute ? 'text-emerald-500' : 'text-amber-500'}
              strokeDasharray={`${analysis.successProbability}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round" />
            
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {analysis.successProbability}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Success
            </span>
          </div>
        </div>

        <Badge
          variant={isDispute ? 'success' : 'warning'}
          size="md"
          className="text-base px-4 py-1.5">
          
          {isDispute ? 'DISPUTE FINE' : 'PAY FINE'}
        </Badge>
      </div>

      <div className="p-6">
        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
          Key Findings
        </h5>
        <ul className="space-y-3 mb-6">
          {analysis.reasons.map((reason, idx) =>
          <li
            key={idx}
            className="flex items-start text-sm text-gray-600 dark:text-gray-300">
            
              {isDispute ?
            <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" /> :

            <XCircleIcon className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            }
              {reason}
            </li>
          )}
        </ul>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Estimated Savings
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(analysis.estimatedSavings)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Risk Level
            </p>
            <div className="flex items-center">
              <AlertTriangleIcon
                className={`w-4 h-4 mr-1 ${analysis.riskLevel === 'low' ? 'text-emerald-500' : analysis.riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'}`} />
              
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {analysis.riskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>);

}