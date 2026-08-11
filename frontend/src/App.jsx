import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import PortalHome from './pages/portal/PortalHome';
import GuestDashboard from './pages/portal/GuestDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookingManagement from './pages/admin/BookingManagement';
import RoomManagement from './pages/admin/RoomManagement';
import GuestManagement from './pages/admin/GuestManagement';
import BillingManagement from './pages/admin/BillingManagement';
import HousekeepingPage from './pages/admin/HousekeepingPage';
import ReportsPage from './pages/admin/ReportsPage';
import StaffManagement from './pages/admin/StaffManagement';

// Protected Route Wrapper with Permission Validation
function ProtectedRoute({ children, module, action = 'view' }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Verifying Permissions...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (module && !hasPermission(module, action)) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#f87171', marginBottom: '12px' }}>Access Restricted (403 Forbidden)</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Your user account ({user.role}) does not possess elevated permission for module <strong>'{module}'</strong>.
        </p>
        <a href="/admin" className="btn btn-secondary">Return to Dashboard</a>
      </div>
    );
  }

  return children;
}

// Smart Admin Home Router Component that redirects staff users to their allowed home section
function AdminHomeRouter() {
  const { user, hasPermission } = useAuth();

  if (hasPermission('reports')) return <AdminDashboard />;
  if (hasPermission('bookings')) return <Navigate to="/admin/bookings" replace />;
  if (hasPermission('rooms')) return <Navigate to="/admin/rooms" replace />;
  if (hasPermission('guests')) return <Navigate to="/admin/guests" replace />;
  if (hasPermission('billing')) return <Navigate to="/admin/billing" replace />;
  if (hasPermission('housekeeping')) return <Navigate to="/admin/housekeeping" replace />;
  if (hasPermission('staff')) return <Navigate to="/admin/staff" replace />;

  return (
    <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#f87171', marginBottom: '12px' }}>Access Restricted (403 Forbidden)</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Your user account ({user?.role}) has no assigned module permissions. Please contact your administrator.
      </p>
    </div>
  );
}

// Inner App Layout component with route-aware sidebar & navbar rendering
function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.pathname === '/login';
  const showSidebar = !isLoginPage && (!!user || location.pathname.startsWith('/admin'));

  const routes = (
    <Routes>
      {/* Online Guest Portal Routes */}
      <Route path="/" element={<PortalHome />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/guest-dashboard" element={<GuestDashboard />} />

      {/* Admin & Staff Panel Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminHomeRouter />
        </ProtectedRoute>
      } />

      <Route path="/admin/bookings" element={
        <ProtectedRoute module="bookings">
          <BookingManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/rooms" element={
        <ProtectedRoute module="rooms">
          <RoomManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/guests" element={
        <ProtectedRoute module="guests">
          <GuestManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/billing" element={
        <ProtectedRoute module="billing">
          <BillingManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/housekeeping" element={
        <ProtectedRoute module="housekeeping">
          <HousekeepingPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/reports" element={
        <ProtectedRoute module="reports">
          <ReportsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/staff" element={
        <ProtectedRoute module="staff">
          <StaffManagement />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (showSidebar) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
        <Sidebar />
        <main style={{ 
          flex: 1, 
          marginLeft: '260px', 
          width: 'calc(100% - 260px)',
          minHeight: '100vh'
        }}>
          {routes}
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <Navbar />
      <main style={{ 
        flex: 1, 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLoginPage ? 'center' : 'stretch',
        justifyContent: isLoginPage ? 'center' : 'flex-start'
      }}>
        {routes}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
