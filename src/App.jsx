import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Online Guest Portal Routes */}
              <Route path="/" element={<PortalHome />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/guest-dashboard" element={<GuestDashboard />} />

              {/* Admin & Staff Panel Protected Routes */}
              <Route path="/admin" element={
                <ProtectedRoute module="reports">
                  <AdminDashboard />
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
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
