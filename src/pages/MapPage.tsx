import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { FinesMap } from '../components/map/FinesMap';
import { mockCameraHotspots } from '../data/mockData';
import { PageHeader } from '../components/layout/PageHeader';
import { MapPinIcon, AlertTriangleIcon } from 'lucide-react';
export function MapPage() {
  const { state } = useAppStore();
  const [viewMode, setViewMode] = useState<'fines' | 'hotspots'>('fines');
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
      className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      
      <PageHeader
        title="Fine Locations & Hotspots"
        description="Explore where you've been fined and national camera hotspots." />
      

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setViewMode('fines')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'fines' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
          
          My Fines
        </button>
        <button
          onClick={() => setViewMode('hotspots')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'hotspots' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
          
          Camera Hotspots
        </button>
      </div>

      <div className="flex-1 min-h-[400px] relative">
        <FinesMap
          viewMode={viewMode}
          fines={state.fines}
          hotspots={mockCameraHotspots} />
        
      </div>

      {viewMode === 'hotspots' &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {mockCameraHotspots.map((hotspot) => {
          const fakeDistance = (Math.random() * 15 + 1).toFixed(1);
          return (
            <div
              key={hotspot.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start gap-3">
              
                <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                  <AlertTriangleIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {hotspot.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {hotspot.totalFines} total fines recorded
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-red-600 font-medium">
                      {hotspot.disputeRate}% dispute success
                    </p>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {fakeDistance} km away
                    </p>
                  </div>
                </div>
              </div>);

        })}
        </div>
      }
    </motion.div>);

}