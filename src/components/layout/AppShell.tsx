import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAppStore } from '../../stores/useAppStore';
interface AppShellProps {
  children: React.ReactNode;
}
export function AppShell({ children }: AppShellProps) {
  const { state } = useAppStore();
  const isDisputePage = state.activeTab === 'dispute';
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className={`flex-1 overflow-y-auto pb-20 md:pb-8 ${isDisputePage ? 'pb-8' : ''}`}>
          
          <div className="max-w-5xl mx-auto w-full p-4 md:p-8">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>);

}