import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus, User, CheckCircle, XCircle, LogOut, PhoneCall, Globe, AlertTriangle, Upload, Eye, FileText, Users, X, Sparkles } from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Walk-in / Front-Desk Reservation Modal
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');
  const [idCardImage, setIdCardImage] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [guestsCount, setGuestsCount] = useState(1);
  const [additionalGuests, setAdditionalGuests] = useState([]);

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

  // View Guest & Reservation Details Modal
  const [viewBooking, setViewBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const [bData, rData] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms')
      ]);
      setBookings(bData);
      setRooms(rData.filter(r => r.status === 'Available'));
      if (rData.filter(r => r.status === 'Available').length > 0 && !selectedRoom) {
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

  // Update additional guests array whenever guestsCount changes
  useEffect(() => {
    const neededCompanions = Math.max(0, guestsCount - 1);
    setAdditionalGuests(prev => {
      if (prev.length < neededCompanions) {
        const next = [...prev];
        for (let i = prev.length; i < neededCompanions; i++) {
          next.push({ name: '', idType: 'Passport', idNumber: '', phone: '' });
        }
        return next;
      }
      return prev.slice(0, neededCompanions);
    });
  }, [guestsCount]);

  // Handle ID Card Upload to Cloudinary
  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/rooms/upload-image', formData);
      if (res.url) {
        setIdCardImage(res.url);
      }
    } catch (err) {
      setError('ID document upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingId(false);
    }
  };

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/bookings', {
        roomId: selectedRoom,
        checkInDate,
        checkOutDate,
        guestsCount: parseInt(guestsCount),
        guestDetails: {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          idType,
          idNumber,
          idCardImage,
          additionalGuests
        },
        source,
        paymentMethod
      });
      setShowModal(false);
      // Reset form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setIdNumber('');
      setIdCardImage('');
      setGuestsCount(1);
      setAdditionalGuests([]);
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

  const updateCompanionGuest = (index, field, value) => {
    setAdditionalGuests(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const { hasPermission } = useAuth();

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
            Unified <span className="text-gradient">Booking & Reservation Manager</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Real-time reservations sync across online portal, walk-ins, guest ID uploads, and multi-guest details
          </p>
        </div>
        {hasPermission('bookings', 'create') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Front-Desk Reservation
          </button>
        )}
      </div>

      {/* Bookings List */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>BOOKING CODE</th>
              <th style={{ padding: '12px' }}>PRIMARY GUEST & ID</th>
              <th style={{ padding: '12px' }}>GUESTS STAYING</th>
              <th style={{ padding: '12px' }}>ROOM ASSIGNED</th>
              <th style={{ padding: '12px' }}>DATES</th>
              <th style={{ padding: '12px' }}>TOTAL PRICE</th>
              <th style={{ padding: '12px' }}>STATUS</th>
              <th style={{ padding: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                  {b.bookingCode}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {b.guest?.name || 'Walk-in Guest'}
                    {b.guest?.idCardImage && (
                      <span title="ID Card Uploaded" style={{ color: '#059669', fontSize: '0.75rem', background: 'rgba(5, 150, 105, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                        ✓ ID Uploaded
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.guest?.email}</div>
                  {b.guest?.idNumber && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {b.guest.idType || 'ID'}: {b.guest.idNumber}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#0f172a' }}>
                    <Users size={14} color="var(--accent-primary)" />
                    {b.guestsCount || 1} Person(s)
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>Room {b.room?.roomNumber}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.room?.roomType?.name}</div>
                </td>
                <td style={{ padding: '16px 12px', fontSize: '0.82rem', color: '#334155' }}>
                  <div>In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                  <div>Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>
                  PKR {b.totalAmount}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: b.status === 'Confirmed' ? 'rgba(5, 150, 105, 0.1)' : b.status === 'Pending' ? 'rgba(217, 119, 6, 0.15)' : b.status === 'Checked-In' ? 'rgba(59, 130, 246, 0.1)' : b.status === 'Checked-Out' ? 'rgba(100, 116, 139, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                    color: b.status === 'Confirmed' ? '#059669' : b.status === 'Pending' ? '#d97706' : b.status === 'Checked-In' ? '#2563eb' : b.status === 'Checked-Out' ? '#64748b' : '#e11d48',
                    border: b.status === 'Pending' ? '1px solid #fde68a' : 'none'
                  }}>
                    {b.status === 'Pending' ? 'Pending Approval' : b.status}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary" onClick={() => setViewBooking(b)} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      <Eye size={12} /> Details
                    </button>
                    {hasPermission('bookings', 'edit') && b.status === 'Pending' && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleStatusUpdate(b._id, 'Confirmed')} 
                        style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#059669', borderColor: '#059669', color: '#ffffff', fontWeight: '700' }}
                        title="Approve and confirm guest reservation"
                      >
                        <CheckCircle size={12} /> Approve & Confirm
                      </button>
                    )}
                    {hasPermission('bookings', 'edit') && b.status === 'Confirmed' && (
                      <button className="btn btn-secondary" onClick={() => handleStatusUpdate(b._id, 'Checked-In')} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        Check In
                      </button>
                    )}
                    {hasPermission('bookings', 'edit') && b.status === 'Checked-In' && (
                      <button className="btn btn-secondary" onClick={() => handleStatusUpdate(b._id, 'Checked-Out')} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        Check Out
                      </button>
                    )}
                    {(hasPermission('bookings', 'delete') || hasPermission('bookings', 'edit')) && b.status !== 'Cancelled' && b.status !== 'Checked-Out' && (
                      <button className="btn btn-secondary" onClick={() => openCancelDialog(b)} style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#dc2626' }}>
                        {b.status === 'Pending' ? 'Decline' : 'Cancel'}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>Create Front-Desk Reservation</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '0.85rem', marginBottom: '14px', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWalkIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Primary Guest Details */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} /> Primary Guest Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Guest Full Name</label>
                    <input type="text" required placeholder="e.g. John Doe" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Email Address</label>
                      <input type="email" required placeholder="john@example.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Phone Number</label>
                      <input type="text" required placeholder="+1 555-0199" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                    </div>
                  </div>

                  {/* ID Document Details & Upload */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>ID Document Type</label>
                      <select value={idType} onChange={e => setIdType(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}>
                        <option value="Passport">Passport</option>
                        <option value="CNIC/National ID">CNIC / National ID</option>
                        <option value="Driver License">Driver License</option>
                        <option value="Other">Other Government ID</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>ID Number</label>
                      <input type="text" placeholder="e.g. A9081231" value={idNumber} onChange={e => setIdNumber(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                    </div>
                  </div>

                  {/* ID Card Image Upload Field */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                      Upload ID Card / Passport Scan (Cloudinary)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {idCardImage ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(5, 150, 105, 0.1)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(5, 150, 105, 0.3)' }}>
                          <img src={idCardImage} alt="ID Document" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>✓ ID Uploaded</span>
                          <button type="button" onClick={() => setIdCardImage('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                      ) : (
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          background: '#ffffff',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          color: '#475569',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}>
                          {uploadingId ? <Sparkles size={16} className="spin" /> : <Upload size={16} />}
                          {uploadingId ? 'Uploading Scan...' : 'Attach ID Photo / Document'}
                          <input type="file" accept="image/*" onChange={handleIdCardUpload} style={{ display: 'none' }} disabled={uploadingId} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room & Dates Selection */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-secondary)' }}>
                  Reservation & Staying Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Select Room</label>
                      <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}>
                        {rooms.map(r => (
                          <option key={r._id} value={r._id}>Room {r.roomNumber} - {r.roomType?.name} (PKR {r.roomType?.basePrice}/night)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Total Staying Guests</label>
                      <select value={guestsCount} onChange={e => setGuestsCount(parseInt(e.target.value))} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}>
                        <option value={1}>1 Guest (Single)</option>
                        <option value={2}>2 Guests (Double)</option>
                        <option value={3}>3 Guests</option>
                        <option value={4}>4 Guests</option>
                        <option value={5}>5 Guests</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Check-in Date</label>
                      <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Check-out Date</label>
                      <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Companion Guests Section (if guestsCount > 1) */}
              {guestsCount > 1 && (
                <div style={{ background: 'rgba(147, 51, 234, 0.04)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#9333ea', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> Companion Guest Information ({additionalGuests.length} Additional)
                  </h3>
                  
                  {additionalGuests.map((companion, idx) => (
                    <div key={idx} style={{ padding: '12px', background: '#ffffff', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                        Guest #{idx + 2} (Companion)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="Companion Full Name"
                          value={companion.name}
                          onChange={e => updateCompanionGuest(idx, 'name', e.target.value)}
                          style={{ padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Phone / Contact (Optional)"
                          value={companion.phone}
                          onChange={e => updateCompanionGuest(idx, 'phone', e.target.value)}
                          style={{ padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                        <select
                          value={companion.idType}
                          onChange={e => updateCompanionGuest(idx, 'idType', e.target.value)}
                          style={{ padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', fontSize: '0.85rem' }}
                        >
                          <option value="Passport">Passport</option>
                          <option value="CNIC/National ID">CNIC / National ID</option>
                          <option value="Driver License">Driver License</option>
                        </select>
                        <input
                          type="text"
                          placeholder="ID / Passport Number"
                          value={companion.idNumber}
                          onChange={e => updateCompanionGuest(idx, 'idNumber', e.target.value)}
                          style={{ padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Source & Payment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Reservation Source</label>
                  <select value={source} onChange={e => setSource(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}>
                    <option value="walk-in">Walk-in Front-Desk</option>
                    <option value="phone">Phone Booking</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Payment Option</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}>
                    <option value="pay_at_hotel">Pay at Hotel</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash Payment</option>
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

      {/* Details View Modal */}
      {viewBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>Reservation Details ({viewBooking.bookingCode})</h2>
              <button onClick={() => setViewBooking(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>Primary Guest</h3>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a' }}>{viewBooking.guest?.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email: {viewBooking.guest?.email}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Phone: {viewBooking.guest?.phone}</div>
                {viewBooking.guest?.idNumber && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                    Document: {viewBooking.guest?.idType} ({viewBooking.guest?.idNumber})
                  </div>
                )}

                {/* ID Card Image Preview */}
                {viewBooking.guest?.idCardImage && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Uploaded ID Scan:</div>
                    <a href={viewBooking.guest.idCardImage} target="_blank" rel="noopener noreferrer">
                      <img src={viewBooking.guest.idCardImage} alt="ID Document" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', border: '1px solid #cbd5e1', objectFit: 'contain' }} />
                    </a>
                  </div>
                )}
              </div>

              {/* Staying Guests */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--accent-secondary)', marginBottom: '8px' }}>
                  Staying Occupants ({viewBooking.guestsCount || 1} Total)
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' }}>1. {viewBooking.guest?.name} (Primary)</div>
                {viewBooking.guest?.additionalGuests && viewBooking.guest.additionalGuests.map((g, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '12px', borderLeft: '2px solid var(--accent-primary)' }}>
                    {idx + 2}. {g.name || 'Companion Guest'} {g.idNumber ? `(${g.idType}: ${g.idNumber})` : ''}
                  </div>
                ))}
              </div>

              {/* Room & Bill */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Room Assigned:</span>
                  <strong style={{ color: '#0f172a' }}>Room {viewBooking.room?.roomNumber} ({viewBooking.room?.roomType?.name})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Check-in:</span>
                  <span style={{ color: '#0f172a' }}>{new Date(viewBooking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Check-out:</span>
                  <span style={{ color: '#0f172a' }}>{new Date(viewBooking.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #cbd5e1', fontSize: '1.1rem', fontWeight: '800' }}>
                  <span>Total Charges:</span>
                  <span style={{ color: 'var(--accent-primary)' }}>PKR {viewBooking.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '28px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#dc2626', marginBottom: '12px' }}>Cancel Reservation</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Are you sure you want to cancel booking <strong>{targetBooking?.bookingCode}</strong>?
            </p>

            <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '16px', fontSize: '0.82rem', color: '#dc2626' }}>
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Cancellation Policy: 100% refund if &gt;24h before check-in, 50% refund within 24h.
            </div>

            <textarea
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Booking</button>
              <button className="btn btn-primary" onClick={handleConfirmCancel} style={{ background: '#dc2626' }}>Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
