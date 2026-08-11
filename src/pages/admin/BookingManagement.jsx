import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { Calendar, Plus, User, CheckCircle, XCircle, LogOut, PhoneCall, Globe, AlertTriangle } from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Walk-in / Phone Reservation Modal
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [source, setSource] = useState('walk-in');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [error, setError] = useState('');

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    try {
      const [bData, rData] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms')
      ]);
      setBookings(bData);
      setRooms(rData.filter(r => r.status === 'Available'));
      if (rData.filter(r => r.status === 'Available').length > 0) {
        setSelectedRoom(rData.filter(r => r.status === 'Available')[0]._id);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    socket.on('booking_created', () => fetchBookings());
    socket.on('booking_updated', () => fetchBookings());

    return () => {
      socket.off('booking_created');
      socket.off('booking_updated');
    };
  }, []);

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/bookings', {
        roomId: selectedRoom,
        checkInDate,
        checkOutDate,
        guestDetails: {
          name: guestName,
          email: guestEmail,
          phone: guestPhone
        },
        source,
        paymentMethod
      });
      setShowModal(false);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to create reservation.');
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const openCancelDialog = (b) => {
    setTargetBooking(b);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetBooking) return;
    try {
      await api.put(`/bookings/${targetBooking._id}/status`, {
        status: 'Cancelled',
        cancellationReason: cancelReason
      });
      setShowCancelModal(false);
      setCancelReason('');
      setTargetBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Unified <span className="text-gradient">Booking & Reservation Manager</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Real-time reservations sync across online portal, walk-ins, and phone bookings
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Front-Desk Reservation
        </button>
      </div>

      {/* Bookings List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>BOOKING CODE</th>
              <th style={{ padding: '12px' }}>GUEST NAME</th>
              <th style={{ padding: '12px' }}>ROOM ASSIGNED</th>
              <th style={{ padding: '12px' }}>DATES</th>
              <th style={{ padding: '12px' }}>SOURCE</th>
              <th style={{ padding: '12px' }}>TOTAL PRICE</th>
              <th style={{ padding: '12px' }}>STATUS</th>
              <th style={{ padding: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px', fontWeight: '700', color: 'var(--accent-secondary)' }}>
                  {b.bookingCode}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: '700', color: '#fff' }}>{b.guest?.name || 'Walk-in Guest'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.guest?.email}</div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ fontWeight: '700', color: '#fff' }}>Room {b.room?.roomNumber}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.room?.roomType?.name}</div>
                </td>
                <td style={{ padding: '16px 12px', fontSize: '0.82rem' }}>
                  <div>In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                  <div>Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {b.source === 'portal' ? <Globe size={12} /> : <PhoneCall size={12} />}
                    {b.source}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', fontWeight: '800', color: '#fff' }}>
                  ${b.totalAmount}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: b.status === 'Confirmed' ? 'rgba(99, 102, 241, 0.15)' : b.status === 'Checked-In' ? 'rgba(34, 197, 94, 0.15)' : b.status === 'Checked-Out' ? 'rgba(156, 163, 175, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: b.status === 'Confirmed' ? '#818cf8' : b.status === 'Checked-In' ? '#4ade80' : b.status === 'Checked-Out' ? '#9ca3af' : '#f87171'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {b.status === 'Confirmed' && (
                      <button className="btn btn-secondary" onClick={() => handleStatusUpdate(b._id, 'Checked-In')} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        Check In
                      </button>
                    )}
                    {b.status === 'Checked-In' && (
                      <button className="btn btn-secondary" onClick={() => handleStatusUpdate(b._id, 'Checked-Out')} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        Check Out
                      </button>
                    )}
                    {b.status !== 'Cancelled' && b.status !== 'Checked-Out' && (
                      <button className="btn btn-secondary" onClick={() => openCancelDialog(b)} style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#f87171' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Front-Desk Reservation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Create Reservation</h2>

            {error && (
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWalkIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Guest Full Name</label>
                <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone</label>
                  <input type="text" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Room</label>
                <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>Room {r.roomNumber} - {r.roomType?.name} (${r.roomType?.basePrice}/night)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-in</label>
                  <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-out</label>
                  <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Source</label>
                  <select value={source} onChange={e => setSource(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}>
                    <option value="walk-in">Walk-in</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}>
                    <option value="pay_at_hotel">Pay at Hotel</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#f87171', marginBottom: '12px' }}>Cancel Reservation</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Are you sure you want to cancel booking <strong>{targetBooking?.bookingCode}</strong>?
            </p>

            <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '16px', fontSize: '0.82rem', color: '#f87171' }}>
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Cancellation Policy: 100% refund if &gt;24h before check-in, 50% refund within 24h.
            </div>

            <textarea
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Booking</button>
              <button className="btn btn-primary" onClick={handleConfirmCancel} style={{ background: '#ef4444' }}>Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
