import React from 'react';
import { AppProvider, useAppStore } from './stores/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { FinesPage } from './pages/FinesPage';
import { FineDetailPage } from './pages/FineDetailPage';
import { DisputePage } from './pages/DisputePage';
import { DisputesPage } from './pages/DisputesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MapPage } from './pages/MapPage';
import { LicensesPage } from './pages/LicensesPage';
import { DriverLicencePage } from './pages/DriverLicencePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SupportPage } from './pages/SupportPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { DataRightsPage } from './pages/DataRightsPage';
import { AartoPointsPage } from './pages/AartoPointsPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { PopiaConsentModal } from './components/modals/PopiaConsentModal';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';

function AppContent() {
  const { state } = useAppStore();

  if (!state.isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        {state.activeTab === 'register' ?
        <RegisterPage key="register" /> :
        state.activeTab === 'forgot-password' ?
        <ForgotPasswordPage key="forgot-password" /> :

        <LoginPage key="login" />
        }
      </AnimatePresence>);

  }

  const renderPage = () => {
    switch (state.activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'vehicle-detail':
        return <VehicleDetailPage />;
      case 'fines':
        return <FinesPage />;
      case 'fine-detail':
        return <FineDetailPage />;
      case 'dispute':
        return <DisputePage />;
      case 'disputes':
        return <DisputesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'map':
        return <MapPage />;
      case 'licenses':
        return <LicensesPage />;
      case 'driver-licence':
        return <DriverLicencePage />;
      case 'payments':
        return <PaymentsPage />;
      case 'support':
        return <SupportPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'data-rights':
        return <DataRightsPage />;
      case 'aarto-points':
        return <AartoPointsPage />;
      case 'documents':
        return <DocumentVaultPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell>
      {!state.popiaConsent.accepted && state.activeTab !== 'privacy' &&
      <PopiaConsentModal />
      }
      <AnimatePresence mode="wait">
        <div key={state.activeTab} className="h-full">
          {renderPage()}
        </div>
      </AnimatePresence>
    </AppShell>);

}

export function App() {
  return (
    <AppProvider>
      <Toaster position="top-center" />
      <AppContent />
    </AppProvider>);

}