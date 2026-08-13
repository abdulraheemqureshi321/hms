import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Plus, Edit2, Trash2, Power, CheckCircle, AlertTriangle, X } from 'lucide-react';

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

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Receptionist');
  const [shift, setShift] = useState('Morning');
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

  const openCreateModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole(user?.role === 'Admin' ? 'Manager' : 'Receptionist');
    setShift('Morning');
    setSelectedPermissions([]);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingStaff(item);
    setName(item.name);
    setEmail(item.email);
    setPassword('');
    setRole(item.role);
    setShift(item.shift || 'Morning');
    setSelectedPermissions(item.permissions || []);
    setError('');
    setShowModal(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingStaff) {
        // Edit existing staff account
        const payload = {
          name,
          role,
          shift,
          permissions: selectedPermissions
        };
        if (password) payload.password = password;

        await api.put(`/auth/staff/${editingStaff._id}`, payload);
        setSuccess(`Updated staff account for ${name} successfully.`);
      } else {
        // Create new staff account
        await api.post('/auth/staff', {
          name,
          email,
          password,
          role,
          shift,
          permissions: selectedPermissions
        });
        setSuccess(`Account created for ${name} (${role}) successfully.`);
      }

      setShowModal(false);
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = !item.isActive;
      await api.put(`/auth/staff/${item._id}`, { isActive: newStatus });
      setSuccess(`Staff account for ${item.name} is now ${newStatus ? 'Active' : 'Suspended'}.`);
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleDeleteStaff = async (item) => {
    if (!window.confirm(`Are you sure you want to delete staff account '${item.name}' (${item.email})?`)) {
      return;
    }

    try {
      await api.delete(`/auth/staff/${item._id}`);
      setSuccess(`Deleted staff account '${item.name}' successfully.`);
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to delete staff account.');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1400px' }}>
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            Staff & <span className="text-gradient">RBAC Access Control</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {user?.role === 'Admin'
              ? 'Admin Mode: Full privilege control over Managers & Staff'
              : 'Manager Mode: Assign employee permissions within your own granted limits'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Create Staff Account
        </button>
      </div>

      {success && (
        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', color: '#059669', marginBottom: '20px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{success}</span>
          <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSuccess('')} />
        </div>
      )}

      {error && (
        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#dc2626', marginBottom: '20px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <X size={16} style={{ cursor: 'pointer' }} onClick={() => setError('')} />
        </div>
      )}

      {/* Staff Members List */}
      <div className="glass-panel" style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>NAME / EMAIL</th>
                <th style={{ padding: '12px' }}>ROLE</th>
                <th style={{ padding: '12px' }}>SHIFT SCHEDULE</th>
                <th style={{ padding: '12px' }}>CREATED BY</th>
                <th style={{ padding: '12px' }}>MODULE PERMISSIONS</th>
                <th style={{ padding: '12px' }}>STATUS</th>
                <th style={{ padding: '12px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.email}</div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: item.role === 'Admin' ? 'rgba(225, 29, 72, 0.1)' : item.role === 'Manager' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                      color: item.role === 'Admin' ? '#e11d48' : item.role === 'Manager' ? '#d97706' : '#059669'
                    }}>
                      {item.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                      {item.shift || 'Morning'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>
                    {item.created_by ? item.created_by.name : 'System'}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    {item.role === 'Admin' ? (
                      <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>Full Unrestricted Access</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.permissions?.map((p, idx) => (
                          <span key={idx} style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '0.75rem', border: '1px solid #cbd5e1', color: '#334155' }}>
                            {p.module} ({p.actions.join(',')})
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ color: item.isActive ? '#059669' : '#e11d48', fontWeight: '700', fontSize: '0.85rem' }}>
                      {item.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    {item.role !== 'Admin' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openEditModal(item)}
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          title="Edit Staff Account & Permissions"
                        >
                          <Edit2 size={12} /> Edit
                        </button>

                        <button
                          className="btn btn-secondary"
                          onClick={() => handleToggleStatus(item)}
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 8px', 
                            color: item.isActive ? '#d97706' : '#059669', 
                            borderColor: item.isActive ? '#fde68a' : '#a7f3d0' 
                          }}
                          title={item.isActive ? 'Suspend Account' : 'Activate Account'}
                        >
                          <Power size={12} /> {item.isActive ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          className="btn btn-secondary"
                          onClick={() => handleDeleteStaff(item)}
                          style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#e11d48', borderColor: '#fca5a5' }}
                          title="Delete Account"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Creation / Editing Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', color: '#0f172a' }}>
              {editingStaff ? `Edit Staff Account: ${editingStaff.name}` : 'Create New Staff Account'}
            </h2>

            {error && (
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#dc2626', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-cols-2">
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px', display: 'block', fontWeight: '600' }}>Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px', display: 'block', fontWeight: '600' }}>Email</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingStaff}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: editingStaff ? '#f1f5f9' : '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px', display: 'block', fontWeight: '600' }}>
                    Password {editingStaff && '(Leave blank to keep unchanged)'}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingStaff ? '••••••••' : ''}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px', display: 'block', fontWeight: '600' }}>Assign Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={user?.role !== 'Admin'}
                    style={{ width: '100%', padding: '10px', background: user?.role !== 'Admin' ? '#f1f5f9' : '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    {user?.role === 'Admin' && <option value="Manager">Manager</option>}
                    <option value="Receptionist">Receptionist</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px', display: 'block', fontWeight: '600' }}>Duty / Shift Schedule</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                >
                  <option value="Morning">Morning Shift (08:00 AM - 04:00 PM)</option>
                  <option value="Evening">Evening Shift (04:00 PM - 12:00 AM)</option>
                  <option value="Night">Night Shift (12:00 AM - 08:00 AM)</option>
                  <option value="Flexible">Flexible / Rotational Shift</option>
                </select>
              </div>

              {/* Granular Module Permissions Selector */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '12px', marginBottom: '8px', display: 'block', color: '#0f172a' }}>
                  Granular Module Permissions
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ALL_MODULES.map((mod) => (
                    <div key={mod.id} style={{ padding: '12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px', color: '#0f172a' }}>{mod.label}</div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {ACTIONS.map(action => (
                          <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
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
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
