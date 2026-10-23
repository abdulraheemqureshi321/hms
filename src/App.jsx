import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { socket } from './services/socket';
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
import { Menu, Building2, PanelLeftClose, PanelLeftOpen, Clock } from 'lucide-react';

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
  const { hasPermission, user } = useAuth();

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('carehaven_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('carehaven_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Global Keyboard Shortcut: Ctrl+B or Cmd+B to toggle sidebar menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Hospitality PMS Clock
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const getPageTitle = (pathname) => {
    if (pathname === '/admin' || pathname === '/admin/') return 'System Overview';
    if (pathname.startsWith('/admin/bookings')) return 'Bookings';
    if (pathname.startsWith('/admin/rooms')) return 'Rooms & Inventory';
    if (pathname.startsWith('/admin/guests')) return 'Guest Directory';
    if (pathname.startsWith('/admin/billing')) return 'Billing & Invoicing';
    if (pathname.startsWith('/admin/housekeeping')) return 'Housekeeping';
    if (pathname.startsWith('/admin/reports')) return 'Reports & Analytics';
    if (pathname.startsWith('/admin/staff')) return 'Staff & Roles';
    if (pathname.startsWith('/guest-dashboard')) return 'My Reservations';
    return 'Operations';
  };

  const isLoginPage = location.pathname === '/login';
  const showSidebar = !isLoginPage && (!!user || location.pathname.startsWith('/admin'));

  // Global Real-time Socket & Background Pre-fetching Strategy
  useEffect(() => {
    if (user && user.role !== 'Guest') {
      // Pre-fetch admin datasets in background for instant 0ms tab switching
      Promise.all([
        api.get('/bookings').catch(() => {}),
        api.get('/rooms').catch(() => {}),
        api.get('/billing/invoices').catch(() => {}),
        api.get('/guests').catch(() => {}),
        api.get('/housekeeping/tasks').catch(() => {}),
        api.get('/reports/dashboard').catch(() => {})
      ]);
    }

    function onRealtimeUpdate() {
      api.invalidateCache();
    }

    socket.on('booking_created', onRealtimeUpdate);
    socket.on('booking_updated', onRealtimeUpdate);
    socket.on('payment_updated', onRealtimeUpdate);
    socket.on('room_status_changed', onRealtimeUpdate);
    socket.on('room_cleaning_updated', onRealtimeUpdate);

    return () => {
      socket.off('booking_created', onRealtimeUpdate);
      socket.off('booking_updated', onRealtimeUpdate);
      socket.off('payment_updated', onRealtimeUpdate);
      socket.off('room_status_changed', onRealtimeUpdate);
      socket.off('room_cleaning_updated', onRealtimeUpdate);
    };
  }, [user]);

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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
        {/* Mobile Top Navigation Bar */}
        <header className="mobile-admin-header" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
            aria-label="Open Navigation"
          >
            <Menu size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #0b5e39 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Building2 size={15} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Care<span style={{ color: '#0b5e39' }}>Haven</span>
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0b5e39', background: '#eaf6f0', padding: '3px 9px', borderRadius: '6px', border: '1px solid rgba(11, 94, 57, 0.2)' }}>
            {user?.role || 'Staff'}
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex' }}>
          <Sidebar 
            isOpen={mobileSidebarOpen} 
            onClose={() => setMobileSidebarOpen(false)} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
          
          <div className="main-content-area" style={{ 
            flex: 1, 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Desktop Top Administrative Bar */}
            <header className="desktop-admin-topbar" style={{
              height: '52px',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              position: 'sticky',
              top: 0,
              zIndex: 90,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              {/* Left: Collapse Toggle + Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={toggleSidebarCollapse}
                  className="btn btn-secondary"
                  title={isSidebarCollapsed ? "Expand sidebar menu (Ctrl+B)" : "Collapse sidebar menu (Ctrl+B)"}
                  style={{
                    padding: '6px 11px',
                    fontSize: '0.78rem',
                    gap: '6px',
                    color: '#475569',
                    borderRadius: '6px',
                    height: '32px'
                  }}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={15} style={{ color: '#0b5e39' }} /> : <PanelLeftClose size={15} />}
                  <span>{isSidebarCollapsed ? 'Open Menu' : 'Close Menu'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                  <span style={{ color: '#0b5e39', fontWeight: 600 }}>CareHaven</span>
                  <span style={{ color: '#cbd5e1' }}>/</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>
                    {getPageTitle(location.pathname)}
                  </span>
                </div>
              </div>

              {/* Right: Hospitality Clock, System Status, User Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="font-mono tabular-nums" style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: '#c89535' }} />
                  <span>{formattedDate} • {formattedTime}</span>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: '#eaf6f0',
                  border: '1px solid rgba(11, 94, 57, 0.18)',
                  color: '#0b5e39',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}>
                  <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  PMS Online
                </div>

                {user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0b5e39 0%, #15803d 100%)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      {user.name}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <main style={{ flex: 1 }}>
              {routes}
            </main>
          </div>
        </div>

        <style>{`
          @media (min-width: 1025px) {
            .main-content-area {
              margin-left: ${isSidebarCollapsed ? '72px' : '260px'};
              width: calc(100% - ${isSidebarCollapsed ? '72px' : '260px'});
            }
            .desktop-admin-topbar {
              display: flex !important;
            }
          }
          @media (max-width: 1024px) {
            .mobile-admin-header {
              display: flex !important;
            }
            .desktop-admin-topbar {
              display: none !important;
            }
            .main-content-area {
              margin-left: 0 !important;
              width: 100% !important;
            }
          }
        `}</style>
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
