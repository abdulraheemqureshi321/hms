import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, History, Mail, Phone, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [idTypeFilter, setIdTypeFilter] = useState('All');
  const [accountTypeFilter, setAccountTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [historyModal, setHistoryModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestHistory, setGuestHistory] = useState([]);

  const fetchGuests = async () => {
    try {
      const data = await api.get(`/guests?search=${encodeURIComponent(search)}`);
      setGuests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [search]);

  const filteredGuests = guests.filter(g => {
    const query = search.toLowerCase();
    const matchesSearch = !query ||
      (g.name && g.name.toLowerCase().includes(query)) ||
      (g.email && g.email.toLowerCase().includes(query)) ||
      (g.phone && g.phone.toLowerCase().includes(query)) ||
      (g.idNumber && g.idNumber.toLowerCase().includes(query));

    const matchesIdType = idTypeFilter === 'All' || g.idType === idTypeFilter;
    const matchesAccountType = accountTypeFilter === 'All' ||
      (accountTypeFilter === 'Portal Account' && !!g.user) ||
      (accountTypeFilter === 'Front-Desk Record' && !g.user);

    let matchesDate = true;
    if (startDate && g.createdAt) {
      const gTime = new Date(g.createdAt).setHours(0,0,0,0);
      const startTime = new Date(startDate).setHours(0,0,0,0);
      if (gTime < startTime) matchesDate = false;
    }
    if (endDate && g.createdAt) {
      const gTime = new Date(g.createdAt).setHours(0,0,0,0);
      const endTime = new Date(endDate).setHours(23,59,59,999);
      if (gTime > endTime) matchesDate = false;
    }

    return matchesSearch && matchesIdType && matchesAccountType && matchesDate;
  });

  const handleExportExcel = () => {
    const exportData = filteredGuests.map(g => ({
      'Guest Name': g.name || '',
      'Email Address': g.email || '',
      'Phone Number': g.phone || '',
      'ID Type': g.idType || 'Passport',
      'ID Number': g.idNumber || 'N/A',
      'Additional Companions': Array.isArray(g.additionalGuests) ? g.additionalGuests.length : 0,
      'Portal Account': g.user ? 'Yes (Registered)' : 'No (Front-Desk Record)',
      'Address': g.address || 'N/A',
      'Notes': g.notes || '',
      'Registered Date': g.createdAt ? new Date(g.createdAt).toLocaleDateString() : ''
    }));
    exportToExcel(exportData, `Guests_Directory_${new Date().toISOString().split('T')[0]}.xlsx`, 'Guests');
  };

  const viewHistory = async (g) => {
    setSelectedGuest(g);
    try {
      const data = await api.get(`/guests/${g._id}/history`);
      setGuestHistory(data);
      setHistoryModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1400px' }}>
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            Guest <span className="text-gradient">Directory & Profiles</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Unified guest records shared across front-desk walk-ins and portal user accounts
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px', background: '#ffffff', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
              placeholder="Search by Name, Email, Phone, or ID Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 12px' }}
            value={idTypeFilter}
            onChange={(e) => setIdTypeFilter(e.target.value)}
          >
            <option value="All">All ID Verification Types</option>
            <option value="Passport">Passport</option>
            <option value="CNIC">CNIC / National ID</option>
            <option value="Driver License">Driver License</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="input-field"
            style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 12px' }}
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
          >
            <option value="All">All Account Types</option>
            <option value="Portal Account">Registered Portal Account</option>
            <option value="Front-Desk Record">Front-Desk Record Only</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>From:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 10px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>To:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 10px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(search || idTypeFilter !== 'All' || accountTypeFilter !== 'All' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setIdTypeFilter('All');
                setAccountTypeFilter('All');
                setStartDate('');
                setEndDate('');
              }}
              style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '0 6px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={handleExportExcel}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 16px', background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 700 }}
        >
          <FileSpreadsheet size={18} /> Export Excel ({filteredGuests.length})
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>GUEST NAME</th>
                <th style={{ padding: '12px' }}>CONTACT DETAILS</th>
                <th style={{ padding: '12px' }}>ID VERIFICATION</th>
                <th style={{ padding: '12px' }}>ACCOUNT TYPE</th>
                <th style={{ padding: '12px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No guests found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(g => (
                  <tr key={g._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0f172a' }}>
                      {g.name}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                        <Mail size={14} /> {g.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                        <Phone size={14} /> {g.phone}
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{g.idType || 'Passport'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{g.idNumber || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: g.user ? 'rgba(147, 51, 234, 0.1)' : '#f1f5f9',
                        color: g.user ? '#9333ea' : '#475569'
                      }}>
                        {g.user ? 'Portal Account' : 'Front-Desk Record'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <button className="btn btn-secondary" onClick={() => viewHistory(g)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        <History size={14} /> Stay History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stay History Modal */}
      {historyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '16px' }}>Stay History for {selectedGuest?.name}</h2>
            
            {guestHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No previous booking history found for this guest.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {guestHistory.map(b => (
                  <div key={b._id} style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a' }}>
                      <span>{b.bookingCode} (Room {b.room?.roomNumber})</span>
                      <span style={{ color: 'var(--accent-primary)' }}>PKR {b.totalAmount}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Check In: {new Date(b.checkInDate).toLocaleDateString()} | Status: {b.status}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
