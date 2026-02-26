import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExamSetup from './pages/ExamSetup';
import FocusMode from './pages/FocusMode';
import ProgressTracking from './pages/ProgressTracking';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGuestMode } from './hooks/useGuestMode';
import { useColorTheme } from './hooks/useColorTheme';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

function ProtectedLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isGuestMode } = useGuestMode();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!identity && !isGuestMode) {
    throw redirect({ to: '/login' });
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AppRoot() {
  // Initialize color theme at root level to apply persisted theme on load
  useColorTheme();
  return <Outlet />;
}

const rootRoute = createRootRoute({ component: AppRoot });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <PageTransition>
      <LoginPage />
    </PageTransition>
  ),
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: () => (
    <PageTransition>
      <Dashboard />
    </PageTransition>
  ),
});

const examSetupRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/exam-setup',
  component: () => (
    <PageTransition>
      <ExamSetup />
    </PageTransition>
  ),
});

const focusModeRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/focus',
  component: () => (
    <PageTransition>
      <FocusMode />
    </PageTransition>
  ),
});

const progressRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/progress',
  component: () => (
    <PageTransition>
      <ProgressTracking />
    </PageTransition>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/settings',
  component: () => (
    <PageTransition>
      <Settings />
    </PageTransition>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    examSetupRoute,
    focusModeRoute,
    progressRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <SubscriptionProvider>
      <RouterProvider router={router} />
    </SubscriptionProvider>
  );
}
