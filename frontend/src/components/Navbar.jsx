import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
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
  LogIn, 
  Globe, 
  Radio
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   GuestNavbar – renders on all non-admin routes
   ───────────────────────────────────────────────────── */
function GuestNavbar({ user, logout, location }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = location.pathname === '/';

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className={`ch-navbar ${isHomePage ? 'ch-navbar-transparent' : ''}`}>
        <div className="ch-nav-container">

          {/* Brand logo */}
          <Link to="/" className="ch-logo-link">
            <div className="ch-logo-icon">
              <Building2 size={24} />
            </div>
            <div className="ch-logo-text-group">
              <div className="ch-logo-text-title">CareHaven Hotel</div>
              <div className="ch-logo-text-sub">LUXURY RESORT &amp; SUITES</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="ch-nav-menu">
            <li><a href="#about"    className="ch-nav-link">About</a></li>
            <li><a href="#location" className="ch-nav-link">Location</a></li>
            <li><a href="#gallery"  className="ch-nav-link">Gallery</a></li>
            <li><a href="#rooms"    className="ch-nav-link">Book Rooms</a></li>
          </ul>

          {/* Right-hand actions */}
          <div className="ch-nav-actions">
            <Link to="/admin" className="ch-staff-link ch-hide-mobile">Staff Portal</Link>

            {user ? (
              <div className="ch-user-action-wrap">
                {user.role === 'Guest' && (
                  <Link
                    to="/guest-dashboard"
                    className="ch-staff-link ch-hide-mobile"
                    style={{ color: 'var(--ch-green)', fontWeight: 700 }}
                  >
                    My Bookings
                  </Link>
                )}
                <div className="ch-user-text ch-hide-mobile" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ch-text-dark)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ch-green)', fontWeight: 600 }}>
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="ch-btn-logout-icon"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--ch-border)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--ch-text-secondary)',
                    flexShrink: 0
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="ch-btn-signin ch-desktop-signin">
                Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="ch-mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile fullscreen nav overlay ── */}
      <nav className={`ch-mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {/* Close button */}
        <button
          className="ch-mobile-nav-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        </button>

        {/* Brand badge */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            color: 'var(--ch-green)', textTransform: 'uppercase', marginBottom: '6px'
          }}>
            CareHaven Hotel
          </div>
          <div style={{ width: '40px', height: '2px', background: 'var(--ch-gold)', margin: '0 auto' }} />
        </div>

        {/* Mobile Logged-in User Card */}
        {user && (
          <div className="ch-mobile-user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'var(--ch-green)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.95rem'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: 'var(--ch-text-dark)', fontSize: '0.95rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ch-green)', fontWeight: 600 }}>{user.role} Account</div>
              </div>
            </div>
            {user.role === 'Guest' && (
              <Link
                to="/guest-dashboard"
                onClick={() => setMobileOpen(false)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--ch-green)',
                  borderColor: 'var(--ch-green)'
                }}
              >
                View My Reservations
              </Link>
            )}
          </div>
        )}

        <div className="ch-mobile-links-group">
          <a href="#about"    className="ch-mobile-nav-link" onClick={() => setMobileOpen(false)}>About</a>
          <a href="#location" className="ch-mobile-nav-link" onClick={() => setMobileOpen(false)}>Location</a>
          <a href="#gallery"  className="ch-mobile-nav-link" onClick={() => setMobileOpen(false)}>Gallery</a>
          <a href="#rooms"    className="ch-mobile-nav-link" onClick={() => setMobileOpen(false)}>Book Rooms</a>
        </div>

        <div className="ch-mobile-actions-group">
          <Link to="/admin" className="ch-mobile-staff-btn" onClick={() => setMobileOpen(false)}>
            Staff Portal
          </Link>
          {user ? (
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="ch-mobile-logout-btn"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="ch-btn-signin"
              onClick={() => setMobileOpen(false)}
              style={{ width: '100%', padding: '12px 32px', fontSize: '1rem', textAlign: 'center' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

/* ─────────────────────────────────────────────────────
   Main Navbar export
   ───────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdminPanel = location.pathname.startsWith('/admin');

  if (isAdminPanel) {
    return null; // Left Sidebar is rendered instead for Admin & Staff Panel
  }

  return <GuestNavbar user={user} logout={logout} location={location} />;
}
