import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Calendar, 
  LogOut, 
  LogIn, 
  Globe, 
  ShieldAlert,
  Image,
  MapPin,
  Info
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdminPanel = location.pathname.startsWith('/admin');

  if (isAdminPanel) {
    return null; // Left Sidebar is rendered instead for Admin & Staff Panel
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Brand Logo */}
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
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.1 }}>
                Care<span className="text-gradient">Haven</span> Hotel
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Luxury Resort & Suites
              </div>
            </div>
          </Link>
        </div>

        {/* Dynamic Public Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => scrollToSection('about-hotel')} 
            className="btn btn-secondary" 
            style={{ border: 'none', background: 'transparent' }}
          >
            <Info size={15} /> About
          </button>

          <button 
            onClick={() => scrollToSection('hotel-gallery')} 
            className="btn btn-secondary" 
            style={{ border: 'none', background: 'transparent' }}
          >
            <Image size={15} /> Gallery
          </button>

          <button 
            onClick={() => scrollToSection('hotel-location')} 
            className="btn btn-secondary" 
            style={{ border: 'none', background: 'transparent' }}
          >
            <MapPin size={15} /> Location
          </button>

          <button 
            onClick={() => scrollToSection('search-rooms')} 
            className="btn btn-secondary"
            style={{ background: 'rgba(5, 150, 105, 0.08)', borderColor: 'rgba(5, 150, 105, 0.2)', color: 'var(--accent-primary)', fontWeight: '700' }}
          >
            <Globe size={15} /> Book Rooms
          </button>

          {user && user.role === 'Guest' && (
            <Link to="/guest-dashboard" className="btn btn-secondary">
              <Calendar size={15} /> My Reservations
            </Link>
          )}
        </nav>

        {/* User Account Menu / Staff Portal Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin" className="btn btn-secondary" style={{ background: 'rgba(217, 119, 6, 0.08)', borderColor: 'rgba(217, 119, 6, 0.2)', color: '#d97706', fontSize: '0.85rem' }}>
            <ShieldAlert size={15} /> Staff Portal
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{user.role}</div>
              </div>
              <button className="btn btn-secondary" onClick={logout} title="Logout" style={{ padding: '8px 12px' }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <LogIn size={15} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
