import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection wrapper component
 * @param {Array<string>} allowedRoles - Roles permitted to view this route (e.g. ['student', 'agent', 'admin'])
 * @param {React.ReactNode} children - Component to render if access is granted
 */
const PrivateRoute = ({ allowedRoles, roles, children }) => {
  const effectiveAllowedRoles = allowedRoles || roles;
  const { user, loading, token } = useAuth();
  const location = useLocation();

  // 1. Render nothing while the auth check runs — no dashboard-wide loader flash
  if (loading) {
    return null;
  }

  // 2. Redirect to Login if unauthenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 'developer' is a full alias for 'super_admin' — same power, same
  // /super-admin/* routes are all allowed — but it also has its own 1:1
  // mirrored route tree under /developer/* (see App.jsx) so the address bar
  // says "developer" instead of "super-admin". `effectiveRole` drives the
  // ALLOWED check below; the redirect TARGETS stay role-specific so a
  // developer always lands on their own prefix, not super_admin's.
  const isDeveloper = user.role === 'developer';
  const effectiveRole = isDeveloper ? 'super_admin' : user.role;

  // 3. Role-specific prefix redirects (skip shared routes like /admin/profile)
  const sharedRoutes = ['/admin/profile'];
  if (effectiveRole === 'super_admin' && location.pathname.startsWith('/admin') && !sharedRoutes.some(r => location.pathname.startsWith(r))) {
    return <Navigate to={isDeveloper ? '/developer/dashboard' : '/super-admin/dashboard'} replace />;
  }
  // A developer on a /super-admin/* URL (an old link, a spot this app
  // forgot to point at /developer/*) gets sent to the exact same page under
  // their own prefix instead of losing their place at the dashboard — the
  // two route trees are 1:1 mirrors.
  if (isDeveloper && location.pathname.startsWith('/super-admin')) {
    return <Navigate to={location.pathname.replace('/super-admin', '/developer') + location.search} replace />;
  }
  if (effectiveRole === 'admin' && location.pathname.startsWith('/super-admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Redirect to Home/Unauthorized if user role is not allowed
  if (effectiveAllowedRoles && !effectiveAllowedRoles.includes(effectiveRole)) {
    return <Navigate to="/" replace />;
  }

  // 5. Authorized; render children
  return children;
};

export default PrivateRoute;
