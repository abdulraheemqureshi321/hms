import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Calendar, 
  BedDouble, 
  Users, 
  CreditCard, 
  Sparkles, 
  BarChart3, 
  UserCheck, 
  LogOut, 
  Globe,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Dark Backdrop Overlay on Mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 140,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)'
          }}
        />
      )}

      <aside className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`} style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.02)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px', marginBottom: '16px' }}>
          {/* Brand Logo & Close Button */}
          <div style={{ marginBottom: '28px', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" onClick={handleNavClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.1 }}>
                  Care<span className="text-gradient">Haven</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                  {user?.role === 'Guest' ? 'Guest Portal' : 'Admin & Staff Panel'}
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button 
              className="mobile-close-btn"
              onClick={onClose}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Section Title */}
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: '700', padding: '0 12px 10px 12px' }}>
            Navigation Menu
          </div>

          {/* Vertical Left Sidebar Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {user?.role === 'Guest' ? (
              <>
                <Link 
                  to="/" 
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    color: location.pathname === '/' ? '#ffffff' : '#475569',
                    background: location.pathname === '/' ? 'var(--accent-gradient)' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: location.pathname === '/' ? '700' : '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Globe size={18} /> Room Search
                </Link>
                <Link 
                  to="/guest-dashboard" 
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    color: location.pathname === '/guest-dashboard' ? '#ffffff' : '#475569',
                    background: location.pathname === '/guest-dashboard' ? 'var(--accent-gradient)' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: location.pathname === '/guest-dashboard' ? '700' : '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Calendar size={18} /> My Reservations
                </Link>
              </>
            ) : (
              <>
                {hasPermission('reports') && (
                  <Link 
                    to="/admin" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <BarChart3 size={18} /> Dashboard
                  </Link>
                )}

                {hasPermission('bookings') && (
                  <Link 
                    to="/admin/bookings" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin/bookings' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin/bookings' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin/bookings' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Calendar size={18} /> Bookings
                  </Link>
                )}

                {hasPermission('rooms') && (
                  <Link 
                    to="/admin/rooms" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin/rooms' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin/rooms' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin/rooms' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <BedDouble size={18} /> Rooms
                  </Link>
                )}

                {hasPermission('guests') && (
                  <Link 
                    to="/admin/guests" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin/guests' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin/guests' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin/guests' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Users size={18} /> Guests
                  </Link>
                )}

                {hasPermission('billing') && (
                  <Link 
                    to="/admin/billing" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin/billing' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin/billing' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin/billing' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CreditCard size={18} /> Billing
                  </Link>
                )}

                {hasPermission('housekeeping') && (
                  <Link 
                    to="/admin/housekeeping" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin/housekeeping' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin/housekeeping' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin/housekeeping' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Sparkles size={18} /> Housekeeping
                  </Link>
                )}

                {hasPermission('staff') && (
                  <Link 
                    to="/admin/staff" 
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: location.pathname === '/admin/staff' ? '#ffffff' : '#475569',
                      background: location.pathname === '/admin/staff' ? 'var(--accent-gradient)' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/admin/staff' ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <UserCheck size={18} /> Staff Access
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Footer Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <Link to="/" onClick={handleNavClick} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', background: 'rgba(5, 150, 105, 0.08)', borderColor: 'rgba(5, 150, 105, 0.2)', color: '#059669' }}>
            <Globe size={16} /> Guest Portal View
          </Link>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{user.role}</div>
              </div>
              <button className="btn btn-secondary" onClick={() => { logout(); handleNavClick(); }} title="Logout" style={{ padding: '8px' }}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-container {
            transform: translateX(-100%);
          }
          .sidebar-container.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
