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
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const navSections = [
    {
      title: 'Front Office',
      items: [
        { permission: 'reports', path: '/admin', label: 'System Overview', icon: BarChart3 },
        { permission: 'bookings', path: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { permission: 'guests', path: '/admin/guests', label: 'Guest Directory', icon: Users },
      ]
    },
    {
      title: 'Operations',
      items: [
        { permission: 'rooms', path: '/admin/rooms', label: 'Rooms & Inventory', icon: BedDouble },
        { permission: 'housekeeping', path: '/admin/housekeeping', label: 'Housekeeping', icon: Sparkles },
      ]
    },
    {
      title: 'Finance & Management',
      items: [
        { permission: 'billing', path: '/admin/billing', label: 'Billing & Ledger', icon: CreditCard },
        { permission: 'reports', path: '/admin/reports', label: 'Analytics Reports', icon: BarChart3 },
        { permission: 'staff', path: '/admin/staff', label: 'Staff & Roles', icon: UserCheck },
      ]
    }
  ];

  const guestItems = [
    { path: '/', label: 'Explore Rooms', icon: Globe },
    { path: '/guest-dashboard', label: 'My Reservations', icon: Calendar },
  ];

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 140,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside className={`sidebar-container ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`} style={{
        width: isCollapsed ? '64px' : '250px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCollapsed ? '16px 8px' : '16px 12px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), padding 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Brand Header */}
          {isCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link to="/" onClick={handleNavClick} title="CareHaven Hotel" style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#0b5e39',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Building2 size={18} strokeWidth={2.2} />
                </div>
              </Link>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title="Expand menu (Ctrl+B)"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    padding: '5px',
                    color: '#0b5e39',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PanelLeftOpen size={15} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '18px', padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" onClick={handleNavClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '7px',
                  background: '#0b5e39',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  <Building2 size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.15 }}>
                    CareHaven
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {user?.role === 'Guest' ? 'Guest Portal' : 'Hotel PMS'}
                  </div>
                </div>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {onToggleCollapse && (
                  <button 
                    onClick={onToggleCollapse}
                    className="desktop-collapse-btn"
                    title="Collapse sidebar (Ctrl+B)"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      padding: '5px',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PanelLeftClose size={15} />
                  </button>
                )}

                <button 
                  className="mobile-close-btn"
                  onClick={onClose}
                  style={{
                    display: 'none',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '3px' : '14px' }}>
            {user?.role === 'Guest' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {guestItems.map(item => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      title={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: isCollapsed ? '0' : '9px',
                        padding: isCollapsed ? '9px 0' : '8px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#0b5e39' : '#334155',
                        background: isActive ? '#f0fdf4' : 'transparent',
                        borderLeft: isActive ? '3px solid #0b5e39' : '3px solid transparent',
                        textDecoration: 'none'
                      }}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} style={{ color: isActive ? '#0b5e39' : '#64748b', flexShrink: 0 }} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ) : (
              navSections.map((section, sIdx) => {
                // Check if user has permission for at least one item in this section
                const visibleItems = section.items.filter(item => hasPermission(item.permission));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {!isCollapsed ? (
                      <div style={{ 
                        fontSize: '0.625rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        color: '#94a3b8', 
                        fontWeight: 700, 
                        padding: '0 8px 4px 8px' 
                      }}>
                        {section.title}
                      </div>
                    ) : (
                      sIdx > 0 && <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 6px' }} />
                    )}

                    {visibleItems.map(item => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleNavClick}
                          title={item.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: isCollapsed ? '0' : '9px',
                            padding: isCollapsed ? '8px 0' : '7px 10px',
                            borderRadius: '5px',
                            fontSize: '0.8125rem',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#0b5e39' : '#334155',
                            background: isActive ? '#f0fdf4' : 'transparent',
                            borderLeft: isActive ? '3px solid #0b5e39' : '3px solid transparent',
                            textDecoration: 'none',
                            transition: 'background-color 0.1s ease'
                          }}
                        >
                          <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} style={{ color: isActive ? '#0b5e39' : '#64748b', flexShrink: 0 }} />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                );
              })
            )}
          </nav>
        </div>

        {/* Footer Section */}
        {isCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <Link 
              to="/" 
              onClick={handleNavClick} 
              title="View Hotel Website"
              style={{ 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '6px', 
                color: '#0b5e39', 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0',
                textDecoration: 'none'
              }}
            >
              <Globe size={15} />
            </Link>

            {user && (
              <>
                <div 
                  title={`${user.name} (${user.role})`}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#0b5e39',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button 
                  onClick={() => { logout(); handleNavClick(); }} 
                  title="Sign out" 
                  style={{ 
                    width: '30px', 
                    height: '30px', 
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <Link 
              to="/" 
              onClick={handleNavClick} 
              className="btn btn-secondary btn-sm" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                color: '#0b5e39',
                background: '#f0fdf4',
                borderColor: '#bbf7d0',
                fontWeight: 600
              }}
            >
              <Globe size={13} /> View Hotel Website
            </Link>

            {user && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '6px 8px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#0b5e39',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#0b5e39', fontWeight: 600, textTransform: 'capitalize' }}>
                      {user.role}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); handleNavClick(); }} 
                  title="Sign out" 
                  style={{ 
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    padding: '5px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-container {
            width: 250px !important;
            transform: translateX(-100%);
          }
          .sidebar-container.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
          .desktop-collapse-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
