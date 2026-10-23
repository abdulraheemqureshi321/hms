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
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1380px' }}>
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">CRM & Guest Database</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.025em' }}>
            Guest Directory
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.84rem', marginTop: '2px' }}>
            Unified guest records, identification documents, and historic stay records
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input
              type="text"
              style={{ width: '100%', paddingLeft: '32px', height: '36px', fontSize: '0.82rem', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '6px' }}
              placeholder="Search name, email, phone, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 10px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px', color: '#09090b' }}
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
            style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 10px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px', color: '#09090b' }}
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
          >
            <option value="All">All Account Types</option>
            <option value="Portal Account">Registered Portal Account</option>
            <option value="Front-Desk Record">Front-Desk Record Only</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>From:</span>
            <input
              type="date"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 8px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>To:</span>
            <input
              type="date"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 8px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px' }}
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
              className="btn btn-secondary"
              style={{ height: '36px', padding: '0 10px', fontSize: '0.78rem', color: '#71717a' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={handleExportExcel}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 12px', fontSize: '0.8rem' }}
        >
          <FileSpreadsheet size={15} /> Export Excel ({filteredGuests.length})
        </button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Contact Details</th>
              <th>ID Verification</th>
              <th>Account Type</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#a1a1aa' }}>
                  No guests found matching selected filters.
                </td>
              </tr>
            ) : (
              filteredGuests.map(g => (
                <tr key={g._id}>
                  <td style={{ fontWeight: 600, color: '#09090b' }}>
                    {g.name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#09090b', fontSize: '0.84rem' }}>
                      <Mail size={13} style={{ color: '#71717a' }} /> {g.email}
                    </div>
                    {g.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '0.78rem', marginTop: '2px' }}>
                        <Phone size={13} style={{ color: '#a1a1aa' }} /> {g.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#09090b' }}>{g.idType || 'Passport'}</div>
                    <div className="font-mono" style={{ fontSize: '0.78rem', color: '#71717a' }}>{g.idNumber || 'N/A'}</div>
                  </td>
                  <td>
                    <span className="status-pill" style={{
                      background: g.user ? '#f0fdf4' : '#f4f4f5',
                      color: g.user ? '#166534' : '#52525b'
                    }}>
                      <span className="status-dot" style={{ background: g.user ? '#16a34a' : '#71717a' }} />
                      {g.user ? 'Portal Account' : 'Front-Desk Only'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => viewHistory(g)} style={{ fontSize: '0.74rem', padding: '4px 9px' }}>
                      <History size={12} style={{ marginRight: '4px' }} /> Stays
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
