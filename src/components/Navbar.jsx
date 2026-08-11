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
  ShieldAlert,
  Radio
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const isAdminPanel = location.pathname.startsWith('/admin');

  return (
    <header className="glass-panel" style={{
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px' }}>
        {/* Brand Logo & Portal Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1 }}>
                Care<span className="text-gradient">Haven</span> HMS
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isAdminPanel ? 'Admin & Staff Panel' : 'Online Guest Portal'}
              </div>
            </div>
          </Link>

          {/* Real-time Socket Indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            fontSize: '0.75rem',
            color: isConnected ? '#4ade80' : '#f87171'
          }}>
            <Radio size={12} className={isConnected ? 'animate-pulse' : ''} />
            {isConnected ? 'Real-Time Sync Active' : 'Connecting...'}
          </div>
        </div>

        {/* Dynamic Navigation Links based on Role & Permissions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdminPanel ? (
            <>
              {hasPermission('reports') && (
                <Link to="/admin" className={`btn btn-secondary ${location.pathname === '/admin' ? 'active-nav' : ''}`}>
                  <BarChart3 size={16} /> Dashboard
                </Link>
              )}
              {hasPermission('bookings') && (
                <Link to="/admin/bookings" className={`btn btn-secondary ${location.pathname === '/admin/bookings' ? 'active-nav' : ''}`}>
                  <Calendar size={16} /> Bookings
                </Link>
              )}
              {hasPermission('rooms') && (
                <Link to="/admin/rooms" className={`btn btn-secondary ${location.pathname === '/admin/rooms' ? 'active-nav' : ''}`}>
                  <BedDouble size={16} /> Rooms
                </Link>
              )}
              {hasPermission('guests') && (
                <Link to="/admin/guests" className={`btn btn-secondary ${location.pathname === '/admin/guests' ? 'active-nav' : ''}`}>
                  <Users size={16} /> Guests
                </Link>
              )}
              {hasPermission('billing') && (
                <Link to="/admin/billing" className={`btn btn-secondary ${location.pathname === '/admin/billing' ? 'active-nav' : ''}`}>
                  <CreditCard size={16} /> Billing
                </Link>
              )}
              {hasPermission('housekeeping') && (
                <Link to="/admin/housekeeping" className={`btn btn-secondary ${location.pathname === '/admin/housekeeping' ? 'active-nav' : ''}`}>
                  <Sparkles size={16} /> Housekeeping
                </Link>
              )}
              {hasPermission('staff') && (
                <Link to="/admin/staff" className={`btn btn-secondary ${location.pathname === '/admin/staff' ? 'active-nav' : ''}`}>
                  <UserCheck size={16} /> Staff Access
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="btn btn-secondary">
                <Globe size={16} /> Room Search
              </Link>
              {user && user.role === 'Guest' && (
                <Link to="/guest-dashboard" className="btn btn-secondary">
                  <Calendar size={16} /> My Reservations
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Account Menu / Portal Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAdminPanel ? (
            <Link to="/" className="btn btn-secondary" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <Globe size={16} /> Guest Portal View
            </Link>
          ) : (
            <Link to="/admin" className="btn btn-secondary" style={{ background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <ShieldAlert size={16} /> Staff Panel View
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>{user.role}</div>
              </div>
              <button className="btn btn-secondary" onClick={logout} title="Logout" style={{ padding: '8px 12px' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <LogIn size={16} /> Staff / Guest Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
