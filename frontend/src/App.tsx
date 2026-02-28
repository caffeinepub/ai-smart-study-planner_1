import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGuestMode } from './hooks/useGuestMode';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { SubscriptionProviderComponent } from './contexts/SubscriptionContext';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ExamSetup from './pages/ExamSetup';
import FocusMode from './pages/FocusMode';
import ProgressTracking from './pages/ProgressTracking';
import Settings from './pages/Settings';

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
      {children}
    </div>
  );
}

// Root layout component
function RootLayout() {
  const { identity } = useInternetIdentity();
  const { isGuestMode } = useGuestMode();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Only show profile setup for authenticated (non-guest) users who haven't set up a profile yet
  const showProfileSetup =
    isAuthenticated &&
    !isGuestMode &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  return (
    <>
      <Outlet />
      {showProfileSetup && (
        <ProfileSetupModal
          open={true}
          onComplete={() => {
            // Profile saved, query will auto-refresh
          }}
        />
      )}
    </>
  );
}

// App layout — accessible to all users (guest or authenticated)
function AppLayout() {
  return (
    <Layout>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Layout>
  );
}

// Route definitions
const rootRoute = createRootRoute({ component: RootLayout });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const appLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayout,
  path: '/dashboard',
  component: Dashboard,
});

const setupRoute = createRoute({
  getParentRoute: () => appLayout,
  path: '/setup',
  component: ExamSetup,
});

const focusRoute = createRoute({
  getParentRoute: () => appLayout,
  path: '/focus',
  component: FocusMode,
});

const progressRoute = createRoute({
  getParentRoute: () => appLayout,
  path: '/progress',
  component: ProgressTracking,
});

const settingsRoute = createRoute({
  getParentRoute: () => appLayout,
  path: '/settings',
  component: Settings,
});

// Index route always redirects to dashboard — no auth check needed
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appLayout.addChildren([
    dashboardRoute,
    setupRoute,
    focusRoute,
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
    <SubscriptionProviderComponent>
      <RouterProvider router={router} />
    </SubscriptionProviderComponent>
  );
}
