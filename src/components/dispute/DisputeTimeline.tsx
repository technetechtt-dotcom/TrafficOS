import React from 'react';
import { motion } from 'framer-motion';
import { DisputeLifecycle, DisputeStage } from '../../types';
import { CheckCircleIcon, CircleIcon, ClockIcon } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
interface DisputeTimelineProps {
  lifecycle: DisputeLifecycle;
}
export function DisputeTimeline({ lifecycle }: DisputeTimelineProps) {
  const stages: DisputeStage[] = [
  'submitted',
  'acknowledged',
  'under_review',
  'hearing_scheduled',
  'resolved'];

  const getStageIndex = (stage: DisputeStage) => stages.indexOf(stage);
  const currentIndex = getStageIndex(lifecycle.currentStage);
  return (
    <div className="relative pl-4 md:pl-0">
      <div className="space-y-8">
        {lifecycle.events.map((event, index) => {
          const isComplete = event.isComplete;
          const isCurrent = event.stage === lifecycle.currentStage;
          const isFuture = !isComplete && !isCurrent;
          return (
            <motion.div
              key={event.id}
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: index * 0.1
              }}
              className="relative flex items-start group">
              
              {/* Vertical Line */}
              {index !== lifecycle.events.length - 1 &&
              <div
                className={`absolute left-3 top-8 bottom-[-2rem] w-0.5 ${isComplete ? 'bg-emerald-500' : isCurrent ? 'bg-blue-300 dark:bg-blue-800 border-l-2 border-dashed border-blue-500' : 'bg-gray-200 dark:bg-gray-800'}`} />

              }

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-6 h-6 mr-4 bg-white dark:bg-gray-950">
                {isComplete ?
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> :
                isCurrent ?
                <div className="relative flex items-center justify-center w-6 h-6">
                    <span className="absolute inline-flex w-full h-full bg-blue-400 rounded-full opacity-75 animate-ping"></span>
                    <span className="relative inline-flex w-3 h-3 bg-blue-600 rounded-full"></span>
                  </div> :

                <CircleIcon className="w-5 h-5 text-gray-300 dark:text-gray-700" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                  <h4
                    className={`text-sm font-bold ${isFuture ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                    
                    {event.title}
                  </h4>
                  {event.timestamp &&
                  <span className="text-xs text-gray-500 flex items-center mt-1 sm:mt-0">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {formatDate(event.timestamp)}
                    </span>
                  }
                </div>
                <p
                  className={`text-sm ${isFuture ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  
                  {event.description}
                </p>
              </div>
            </motion.div>);

        })}
      </div>
    </div>);

}