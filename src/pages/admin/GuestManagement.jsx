import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, History, Mail, Phone, FileText } from 'lucide-react';

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
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
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Guest <span className="text-gradient">Directory & Profiles</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Unified guest records shared across front-desk walk-ins and portal user accounts
          </p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>GUEST NAME</th>
              <th style={{ padding: '12px' }}>CONTACT DETAILS</th>
              <th style={{ padding: '12px' }}>ID VERIFICATION</th>
              <th style={{ padding: '12px' }}>ACCOUNT TYPE</th>
              <th style={{ padding: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {guests.map(g => (
              <tr key={g._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px', fontWeight: '700', color: '#fff' }}>
                  {g.name}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Mail size={14} /> {g.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                    <Phone size={14} /> {g.phone}
                  </div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: '600' }}>{g.idType}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{g.idNumber || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: g.user ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: g.user ? '#c084fc' : 'var(--text-secondary)'
                  }}>
                    {g.user ? 'Portal Account' : 'Front-Desk Record'}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <button className="btn btn-secondary" onClick={() => viewHistory(g)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    <History size={14} /> Stay History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stay History Modal */}
      {historyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Stay History for {selectedGuest?.name}</h2>
            
            {guestHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No previous booking history found for this guest.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {guestHistory.map(b => (
                  <div key={b._id} style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span>{b.bookingCode} (Room {b.room?.roomNumber})</span>
                      <span style={{ color: 'var(--accent-secondary)' }}>${b.totalAmount}</span>
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
