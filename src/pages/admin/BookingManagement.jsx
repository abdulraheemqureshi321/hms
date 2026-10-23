import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus, User, CheckCircle, XCircle, LogOut, PhoneCall, Globe, AlertTriangle, Upload, Eye, FileText, Users, X, Sparkles, FileSpreadsheet, Search } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredBookings = bookings.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (b.bookingCode && b.bookingCode.toLowerCase().includes(query)) ||
      (b.guest?.name && b.guest.name.toLowerCase().includes(query)) ||
      (b.guest?.email && b.guest.email.toLowerCase().includes(query)) ||
      (b.room?.roomNumber && b.room.roomNumber.toString().includes(query));

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || b.source === sourceFilter;

    let matchesDate = true;
    if (startDate && b.checkInDate) {
      const checkInTime = new Date(b.checkInDate).setHours(0,0,0,0);
      const startTime = new Date(startDate).setHours(0,0,0,0);
      if (checkInTime < startTime) matchesDate = false;
    }
    if (endDate && b.checkInDate) {
      const checkInTime = new Date(b.checkInDate).setHours(0,0,0,0);
      const endTime = new Date(endDate).setHours(23,59,59,999);
      if (checkInTime > endTime) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesSource && matchesDate;
  });

  const handleExportExcel = () => {
    const exportData = filteredBookings.map(b => ({
      'Booking Code': b.bookingCode || '',
      'Guest Name': b.guest?.name || 'Walk-in Guest',
      'Guest Email': b.guest?.email || '',
      'Guest Phone': b.guest?.phone || '',
      'Room Number': b.room?.roomNumber || '',
      'Room Type': b.room?.roomType?.name || '',
      'Guests Count': b.guestsCount || 1,
      'Check-In Date': b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '',
      'Check-Out Date': b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '',
      'Total Amount ($)': b.totalAmount || 0,
      'Status': b.status || '',
      'Booking Source': b.source || '',
      'Special Requests': b.specialRequests || '',
      'Created At': b.createdAt ? new Date(b.createdAt).toLocaleString() : ''
    }));
    exportToExcel(exportData, `Bookings_Export_${new Date().toISOString().split('T')[0]}.xlsx`, 'Bookings');
  };

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
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1380px' }}>
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">Front Desk & Reservations</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.025em' }}>
            Bookings
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.84rem', marginTop: '2px' }}>
            Reservation ledger across online portal, walk-ins, and direct front-desk registrations
          </p>
        </div>
        {hasPermission('bookings', 'create') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
            <Plus size={15} /> New Walk-In Booking
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input
              type="text"
              style={{ width: '100%', paddingLeft: '32px', height: '36px', fontSize: '0.82rem', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '6px' }}
              placeholder="Search code, guest name, room #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 10px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px', color: '#09090b' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 10px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px', color: '#09090b' }}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All Channels</option>
            <option value="portal">Online Portal</option>
            <option value="walk-in">Walk-in</option>
            <option value="phone">Phone Booking</option>
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

          {(searchQuery || statusFilter !== 'All' || sourceFilter !== 'All' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setSourceFilter('All');
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
          <FileSpreadsheet size={15} /> Export Excel ({filteredBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {/* Bookings Table */}
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Booking Code</th>
              <th>Primary Guest & Contact</th>
              <th>Guests</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#a1a1aa' }}>
                  No reservations found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => {
                const getStatusStyle = (s) => {
                  switch (s) {
                    case 'Confirmed': return { bg: '#f0fdf4', color: '#166534', dot: '#16a34a' };
                    case 'Pending': return { bg: '#fffbeb', color: '#92400e', dot: '#d97706' };
                    case 'Checked-In': return { bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' };
                    case 'Checked-Out': return { bg: '#f4f4f5', color: '#52525b', dot: '#71717a' };
                    case 'Cancelled': return { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' };
                    default: return { bg: '#f4f4f5', color: '#52525b', dot: '#71717a' };
                  }
                };
                const sStyle = getStatusStyle(b.status);

                return (
                  <tr key={b._id}>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap' }}>
                      {b.bookingCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#09090b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {b.guest?.name || 'Walk-in Guest'}
                        {b.guest?.idCardImage && (
                          <span title="ID Document Verified" style={{ color: '#166534', fontSize: '0.7rem', background: '#f0fdf4', padding: '1px 5px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                            ✓ ID
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '1px' }}>{b.guest?.email}</div>
                      {b.guest?.idNumber && (
                        <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '1px' }}>
                          {b.guest.idType || 'ID'}: {b.guest.idNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#52525b', fontSize: '0.82rem' }}>
                        <Users size={13} style={{ color: '#71717a' }} />
                        {b.guestsCount || 1}
                      </span>
                    </td>
                    <td>
                      <div className="font-mono" style={{ fontWeight: 600, color: '#09090b' }}>
                        Room {b.room?.roomNumber}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#71717a' }}>
                        {b.room?.roomType?.name}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#52525b', whiteSpace: 'nowrap' }}>
                      <div>In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                      <div>Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap' }}>
                      PKR {b.totalAmount?.toLocaleString() || b.totalAmount}
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: sStyle.bg, color: sStyle.color, border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span className="status-dot" style={{ background: sStyle.dot }} />
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setViewBooking(b)} 
                          style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '5px' }}
                        >
                          <Eye size={12} /> Details
                        </button>
                        {hasPermission('bookings', 'edit') && b.status === 'Pending' && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleStatusUpdate(b._id, 'Confirmed')} 
                            style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '5px' }}
                            title="Confirm reservation"
                          >
                            <CheckCircle size={12} /> Confirm
                          </button>
                        )}
                        {hasPermission('bookings', 'edit') && b.status === 'Confirmed' && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleStatusUpdate(b._id, 'Checked-In')} 
                            style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '5px' }}
                          >
                            Check In
                          </button>
                        )}
                        {hasPermission('bookings', 'edit') && b.status === 'Checked-In' && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleStatusUpdate(b._id, 'Checked-Out')} 
                            style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '5px' }}
                          >
                            Check Out
                          </button>
                        )}
                        {(hasPermission('bookings', 'delete') || hasPermission('bookings', 'edit')) && b.status !== 'Cancelled' && b.status !== 'Checked-Out' && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => openCancelDialog(b)} 
                            style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '5px', color: '#991b1b', borderColor: '#fecaca' }}
                          >
                            {b.status === 'Pending' ? 'Decline' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Front-Desk Reservation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>Create Front-Desk Reservation</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '0.85rem', marginBottom: '14px', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWalkIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Primary Guest Details */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} /> Primary Guest Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Guest Full Name</label>
                    <input type="text" required placeholder="e.g. John Doe" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }} />
                  </div>

                  <div className="grid-cols-2">
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
                  <div className="grid-cols-2">
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
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-secondary)' }}>
                  Reservation & Staying Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="grid-cols-2">
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

                  <div className="grid-cols-2">
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

              {/* Additional Companion Guests Section */}
              {guestsCount > 1 && (
                <div style={{ background: 'rgba(147, 51, 234, 0.04)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#9333ea', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> Companion Guest Information ({additionalGuests.length} Additional)
                  </h3>
                  
                  {additionalGuests.map((companion, idx) => (
                    <div key={idx} style={{ padding: '10px', background: '#ffffff', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                        Guest #{idx + 2} (Companion)
                      </div>
                      <div className="grid-cols-2" style={{ marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="Companion Full Name"
                          value={companion.name}
                          onChange={e => updateCompanionGuest(idx, 'name', e.target.value)}
                          style={{ padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Phone / Contact"
                          value={companion.phone}
                          onChange={e => updateCompanionGuest(idx, 'phone', e.target.value)}
                          style={{ padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="grid-cols-2">
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
              <div className="grid-cols-2">
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>Reservation Details ({viewBooking.bookingCode})</h2>
              <button onClick={() => setViewBooking(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>Primary Guest</h3>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#0f172a' }}>{viewBooking.guest?.name}</div>
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
                <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-secondary)', marginBottom: '8px' }}>
                  Staying Occupants ({viewBooking.guestsCount || 1} Total)
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>1. {viewBooking.guest?.name} (Primary)</div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #cbd5e1', fontSize: '1.05rem', fontWeight: '800' }}>
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#dc2626', marginBottom: '12px' }}>Cancel Reservation</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
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
