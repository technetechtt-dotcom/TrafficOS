import React from 'react';
import { motion } from 'framer-motion';
import { RiskProfile } from '../../types';
import {
  ZapIcon,
  MapPinIcon,
  ClockIcon,
  CarIcon,
  AlertTriangleIcon } from
'lucide-react';
interface RiskScoreCardProps {
  profile: RiskProfile | null;
  compact?: boolean;
}
export function RiskScoreCard({
  profile,
  compact = false
}: RiskScoreCardProps) {
  if (!profile) return null;
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-emerald-500';
      case 'moderate':
        return 'text-amber-500';
      case 'high':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };
  const getLevelBg = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-500';
      case 'moderate':
        return 'bg-amber-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ZapIcon':
        return <ZapIcon className="w-4 h-4" />;
      case 'MapPinIcon':
        return <MapPinIcon className="w-4 h-4" />;
      case 'ClockIcon':
        return <ClockIcon className="w-4 h-4" />;
      case 'CarIcon':
        return <CarIcon className="w-4 h-4" />;
      default:
        return <AlertTriangleIcon className="w-4 h-4" />;
    }
  };
  const strokeDasharray = `${profile.overallScore}, 100`;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Gauge */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36">
              
              <path
                className="text-gray-100 dark:text-gray-800"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3" />
              
              <path
                className={getLevelColor(profile.level)}
                strokeDasharray={strokeDasharray}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round" />
              
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.overallScore}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${getLevelColor(profile.level)}`}>
                
                {profile.level}
              </span>
            </div>
          </div>

          {/* Top Prediction */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Predictive Risk Engine
            </h3>
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-3 rounded-xl text-sm font-medium flex items-start">
              <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{profile.predictions[0]}</p>
            </div>
          </div>
        </div>

        {!compact &&
        <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Risk Factors
            </h4>
            {profile.factors.map((factor, idx) =>
          <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {getIcon(factor.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {factor.label}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {factor.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div
                  className={`h-1.5 rounded-full ${factor.score > 70 ? 'bg-red-500' : factor.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{
                    width: `${factor.score}%`
                  }} />
                
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {factor.description}
                  </p>
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </div>);

}