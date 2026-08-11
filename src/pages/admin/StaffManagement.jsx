import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Plus, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const ALL_MODULES = [
  { id: 'bookings', label: 'Bookings & Reservations' },
  { id: 'rooms', label: 'Room & Type Management' },
  { id: 'guests', label: 'Guest Directory' },
  { id: 'billing', label: 'Billing & Invoicing' },
  { id: 'housekeeping', label: 'Housekeeping Operations' },
  { id: 'reports', label: 'Reports & Analytics' },
  { id: 'staff', label: 'Staff Account Access' }
];

const ACTIONS = ['view', 'create', 'edit', 'delete'];

export default function StaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role === 'Admin' ? 'Manager' : 'Receptionist');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStaff = async () => {
    try {
      const data = await api.get('/auth/staff');
      setStaffList(data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleActionToggle = (module, action) => {
    setSelectedPermissions(prev => {
      const existingMod = prev.find(p => p.module === module);
      if (!existingMod) {
        return [...prev, { module, actions: [action] }];
      } else {
        const hasAction = existingMod.actions.includes(action);
        const updatedActions = hasAction
          ? existingMod.actions.filter(a => a !== action)
          : [...existingMod.actions, action];

        if (updatedActions.length === 0) {
          return prev.filter(p => p.module !== module);
        }

        return prev.map(p => p.module === module ? { ...p, actions: updatedActions } : p);
      }
    });
  };

  const isActionChecked = (module, action) => {
    const mod = selectedPermissions.find(p => p.module === module);
    return mod ? mod.actions.includes(action) : false;
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/staff', {
        name,
        email,
        password,
        role,
        permissions: selectedPermissions
      });
      setSuccess(`Account created for ${name} (${role}) successfully.`);
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedPermissions([]);
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to create staff account.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Staff & <span className="text-gradient">Hierarchical RBAC Access</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            {user?.role === 'Admin'
              ? 'Admin Mode: Full privilege control over Managers & Staff'
              : 'Manager Mode: Assign employee permissions within your own granted limits'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Staff Account
        </button>
      </div>

      {success && (
        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Staff Members List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>NAME / EMAIL</th>
              <th style={{ padding: '12px' }}>ROLE</th>
              <th style={{ padding: '12px' }}>CREATED BY</th>
              <th style={{ padding: '12px' }}>MODULE PERMISSIONS</th>
              <th style={{ padding: '12px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: '700', color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.email}</div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: item.role === 'Admin' ? 'rgba(239, 68, 68, 0.15)' : item.role === 'Manager' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: item.role === 'Admin' ? '#f87171' : item.role === 'Manager' ? '#c084fc' : '#818cf8'
                  }}>
                    {item.role}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                  {item.created_by ? item.created_by.name : 'System'}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  {item.role === 'Admin' ? (
                    <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: '600' }}>Full Unrestricted Access</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.permissions?.map((p, idx) => (
                        <span key={idx} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                          {p.module} ({p.actions.join(',')})
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ color: item.isActive ? '#4ade80' : '#f87171', fontWeight: '600', fontSize: '0.85rem' }}>
                    {item.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Account Creation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Create New Staff Account</h2>

            {error && (
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Assign Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  >
                    {user?.role === 'Admin' && <option value="Manager">Manager</option>}
                    <option value="Receptionist">Receptionist</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>
              </div>

              {/* Granular Module Permissions Selector */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '12px', marginBottom: '8px', display: 'block' }}>
                  Granular Module Permissions
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ALL_MODULES.map((mod) => (
                    <div key={mod.id} style={{ padding: '12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px' }}>{mod.label}</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {ACTIONS.map(action => (
                          <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isActionChecked(mod.id, action)}
                              onChange={() => handleActionToggle(mod.id, action)}
                            />
                            {action}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
