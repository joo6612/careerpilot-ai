import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './auth/ProtectedRoute';

const AppContent: React.FC = () => {
  const { page } = useApp();

  switch (page) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'onboarding':
      return (
        <ProtectedRoute>
          <OnboardingWizard />
        </ProtectedRoute>
      );
    case 'dashboard':
      return (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      );
    default:
      return <LandingPage />;
  }
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
