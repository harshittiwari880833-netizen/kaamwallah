import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import AuthLayout from './layouts/AuthLayout';
import RouteSkeleton from './components/RouteSkeleton';
import { getRoleRedirect, useAppContext } from './context/AppContext';

const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Support = lazy(() => import('./pages/Support'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PostJob = lazy(() => import('./pages/PostJob'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const Notifications = lazy(() => import('./pages/Notifications'));

function AuthenticatedRoute({ children }) {
  const { isAuthenticated } = useAppContext();
  if (isAuthenticated === undefined) return <RouteSkeleton />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleAwareHome() {
  // Both Client and Worker will use the Home component, which will conditionally render the correct view based on role
  return <Home />;
}

export default function App() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Routes>
        {/* MAIN APP */}
        <Route element={<AppShell />}>
          <Route path="/" element={<RoleAwareHome />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/support" element={<Support />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route
            path="/post-job"
            element={
              <AuthenticatedRoute>
                <PostJob />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <Dashboard />
              </AuthenticatedRoute>
            }
          />
        </Route>

        {/* AUTH ROUTES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/role-selection" element={<RoleSelection />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}