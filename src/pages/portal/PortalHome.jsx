import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../services/socket';
import { Search, Calendar, Users, CheckCircle, Wifi, Tv, Coffee, ShieldCheck, Sparkles, ArrowRight, Printer } from 'lucide-react';

export default function PortalHome() {
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [guestsCount, setGuestsCount] = useState('1');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Booking Checkout Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.get(`/rooms/search?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guestsCount=${guestsCount}`);
      setAvailableRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();

    socket.on('room_status_changed', () => handleSearch());
    socket.on('booking_created', () => handleSearch());

    return () => {
      socket.off('room_status_changed');
      socket.off('booking_created');
    };
  }, []);

  const openBookingModal = (room) => {
    setSelectedRoom(room);
    setBookingSuccess(null);
    setBookingError('');
    setShowModal(true);
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    setBookingError('');
    try {
      const res = await api.post('/bookings', {
        roomId: selectedRoom._id,
        checkInDate,
        checkOutDate,
        guestsCount: parseInt(guestsCount),
        guestDetails: { name, email, phone },
        source: 'portal',
        paymentMethod,
        specialRequests
      });

      setBookingSuccess(res.booking);
    } catch (err) {
      setBookingError(err.message || 'Failed to complete reservation');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px 24px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 1) 70%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontSize: '0.85rem',
            color: '#818cf8',
            marginBottom: '20px'
          }}>
            <Sparkles size={16} /> Real-Time Room Availability & Instant Reservation
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
            Book Your Stay at <span className="text-gradient">CareHaven Luxury Hotel</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 40px auto' }}>
            Experience world-class hospitality. Search dates and reserve your room directly online.
          </p>

          {/* Search Bar */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Guests
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>
                <Search size={18} /> Search Rooms
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Available Rooms Grid */}
      <section className="container" style={{ padding: '60px 24px', maxWidth: '1400px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '24px' }}>
          Available <span className="text-gradient">Accommodations</span> ({availableRooms.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Checking live room availability...</div>
        ) : availableRooms.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No rooms available for the selected dates. Please try different check-in/out dates.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
            {availableRooms.map(room => (
              <div key={room._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {room.roomType?.photos?.[0] ? (
                  <img src={room.roomType.photos[0]} alt={room.roomType.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>
                    Room {room.roomNumber}
                  </div>
                )}

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{room.roomType?.name}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room {room.roomNumber} • Floor {room.floor}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>
                          ${room.roomType?.basePrice}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per night + 10% tax</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {room.roomType?.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {room.roomType?.amenities?.map((a, i) => (
                        <span key={i} style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={() => openBookingModal(room)} style={{ width: '100%' }}>
                    Book Room {room.roomNumber} Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Online Reservation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckCircle size={36} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Booking Confirmed!</h2>
                <div style={{ fontSize: '1.2rem', color: 'var(--accent-secondary)', fontWeight: '800', marginBottom: '16px' }}>
                  Booking Ref: {bookingSuccess.bookingCode}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Your reservation for Room {selectedRoom.roomNumber} ({selectedRoom.roomType?.name}) has been instantly synced to the hotel staff system.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => window.print()}>
                    <Printer size={16} /> Print Confirmation
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>
                  Complete Reservation
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Room {selectedRoom?.roomNumber} ({selectedRoom?.roomType?.name})
                </div>

                {bookingError && (
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleConfirmReservation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone</label>
                      <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Option</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}>
                      <option value="pay_at_hotel">Pay at Hotel</option>
                      <option value="card">Credit / Debit Card (Online Tokenized)</option>
                      <option value="online">Local Online Wallet (JazzCash / EasyPaisa)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Special Requests</label>
                    <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Early check-in, extra bed, high floor..." style={{ width: '100%', height: '60px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Confirm & Pay</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
