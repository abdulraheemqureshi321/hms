import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, AlertTriangle, XCircle, CheckCircle2, Clock } from 'lucide-react';

export default function GuestDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    try {
      const data = await api.get('/bookings/my-bookings');
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelMyBooking = async (bId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.put(`/bookings/${bId}/status`, {
        status: 'Cancelled',
        cancellationReason: 'Cancelled by guest via portal'
      });
      fetchMyBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
          My <span className="text-gradient">Reservations & History</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
          Welcome, {user?.name}! View your upcoming hotel stays and manage your bookings
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        {reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            You do not have any active or past reservations yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reservations.map(b => (
              <div key={b._id} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{b.bookingCode}</span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: b.status === 'Confirmed' ? 'rgba(99, 102, 241, 0.15)' : b.status === 'Checked-In' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: b.status === 'Confirmed' ? '#818cf8' : b.status === 'Checked-In' ? '#4ade80' : '#f87171'
                    }}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Room {b.room?.roomNumber} ({b.room?.roomType?.name})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Check-in: {new Date(b.checkInDate).toLocaleDateString()} • Check-out: {new Date(b.checkOutDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>${b.totalAmount}</div>
                  {b.status === 'Confirmed' && (
                    <button className="btn btn-secondary" onClick={() => handleCancelMyBooking(b._id)} style={{ fontSize: '0.75rem', padding: '6px 12px', marginTop: '8px', color: '#f87171' }}>
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
