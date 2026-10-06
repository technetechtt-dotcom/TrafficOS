import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { TabType } from '../../types';
import { deriveDemeritProfile } from '../../utils/demerits';
import {
  HomeIcon,
  CarIcon,
  FileTextIcon,
  UserIcon,
  BarChart3Icon,
  MapPinIcon,
  IdCardIcon,
  ScaleIcon,
  GaugeIcon,
  CreditCardIcon,
  FolderLockIcon,
  ContactIcon,
  SettingsIcon,
  HelpCircleIcon } from
'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeTone?: 'danger' | 'warning' | 'info';
}

export function Sidebar() {
  const { state, dispatch } = useAppStore();

  const outstanding = state.fines.filter(
    (f) => f.status === 'pending' || f.status === 'overdue'
  ).length;
  const openDisputes = state.disputes.filter(
    (d) => d.currentStage !== 'resolved' && d.currentStage !== 'dismissed'
  ).length;
  const demerits = deriveDemeritProfile(state.fines);

  const groups: {
    heading: string;
    items: NavItem[];
  }[] = [
  {
    heading: 'Overview',
    items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />
    },
    {
      id: 'fines',
      label: 'Fines',
      icon: <FileTextIcon className="w-5 h-5" />,
      badge: outstanding > 0 ? String(outstanding) : undefined,
      badgeTone: 'warning'
    },
    {
      id: 'disputes',
      label: 'Disputes',
      icon: <ScaleIcon className="w-5 h-5" />,
      badge: openDisputes > 0 ? String(openDisputes) : undefined,
      badgeTone: 'info'
    },
    {
      id: 'aarto-points',
      label: 'Demerit Points',
      icon: <GaugeIcon className="w-5 h-5" />,
      badge: demerits.activePoints > 0 ? `${demerits.activePoints}` : undefined,
      badgeTone: demerits.activePoints >= 10 ? 'danger' : 'warning'
    }]

  },
  {
    heading: 'Vehicles & Licences',
    items: [
    {
      id: 'vehicles',
      label: 'My Vehicles',
      icon: <CarIcon className="w-5 h-5" />
    },
    {
      id: 'licenses',
      label: 'Licence Discs',
      icon: <IdCardIcon className="w-5 h-5" />
    },
    {
      id: 'driver-licence',
      label: "Driver's Licence",
      icon: <ContactIcon className="w-5 h-5" />
    }]

  },
  {
    heading: 'Records',
    items: [
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCardIcon className="w-5 h-5" />
    },
    {
      id: 'documents',
      label: 'Document Vault',
      icon: <FolderLockIcon className="w-5 h-5" />
    }]

  },
  {
    heading: 'Insights',
    items: [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3Icon className="w-5 h-5" />
    },
    {
      id: 'map',
      label: 'Map & Hotspots',
      icon: <MapPinIcon className="w-5 h-5" />
    }]

  }];


  const footerItems: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon className="w-5 h-5" />
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon className="w-5 h-5" />
  },
  {
    id: 'support',
    label: 'Support Centre',
    icon: <HelpCircleIcon className="w-5 h-5" />
  }];


  const badgeClasses = {
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
  };

  const renderItem = (item: NavItem) => {
    const isActive = state.activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() =>
        dispatch({
          type: 'SET_TAB',
          payload: item.id
        })
        }
        aria-current={isActive ? 'page' : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive ?
        'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
        'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'}`
        }>
        
        <span className="flex-shrink-0">{item.icon}</span>
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badge &&
        <span
          className={`flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${badgeClasses[item.badgeTone ?? 'info']}`}>
          
            {item.badge}
          </span>
        }
      </button>);

  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {groups.map((group) =>
        <div key={group.heading}>
            <h3 className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {group.heading}
            </h3>
            <div className="space-y-0.5">{group.items.map(renderItem)}</div>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
        {footerItems.map(renderItem)}
      </div>
    </aside>);

}