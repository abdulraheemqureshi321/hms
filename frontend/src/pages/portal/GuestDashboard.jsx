import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'lucide-react';

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

  const getStatusStyle = (s) => {
    switch (s) {
      case 'Confirmed': return { bg: '#eaf6f0', color: '#065f46', dot: '#10b981' };
      case 'Checked-In': return { bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' };
      case 'Checked-Out': return { bg: '#f1f5f9', color: '#475569', dot: '#64748b' };
      default: return { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' };
    }
  };

  return (
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1100px' }}>
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">Guest Itinerary</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.025em' }}>
            My Reservations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '2px' }}>
            Welcome back, {user?.name}. Manage your upcoming hotel stays and booking history
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Loading reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            You do not have any active or past reservations yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reservations.map(b => {
              const sStyle = getStatusStyle(b.status);
              return (
                <div key={b._id} style={{
                  padding: '16px 18px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        {b.bookingCode}
                      </span>
                      <span className="status-pill" style={{ background: sStyle.bg, color: sStyle.color, border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span className="status-dot" style={{ background: sStyle.dot }} />
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '5px', fontWeight: 600 }}>
                      Room {b.room?.roomNumber} • {b.room?.roomType?.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                      Check-in: {new Date(b.checkInDate).toLocaleDateString()} — Check-out: {new Date(b.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0b5e39' }}>
                      PKR {b.totalAmount?.toLocaleString() || b.totalAmount}
                    </div>
                    {b.status === 'Confirmed' && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleCancelMyBooking(b._id)} 
                        style={{ fontSize: '0.74rem', padding: '4px 10px', marginTop: '6px', color: '#991b1b', borderColor: '#fecaca' }}
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
