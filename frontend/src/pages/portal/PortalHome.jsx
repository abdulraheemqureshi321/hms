import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../services/socket';
import { 
  Search, 
  Calendar, 
  Users, 
  CheckCircle, 
  Wifi, 
  Tv, 
  Coffee, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Printer,
  MapPin,
  Phone,
  Mail,
  Clock,
  Compass,
  Star,
  Award,
  Utensils,
  Waves,
  HeartHandshake
} from 'lucide-react';

export default function PortalHome() {
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [guestsCount, setGuestsCount] = useState('1');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Gallery Filter State
  const [activeGalleryTab, setActiveGalleryTab] = useState('all');

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

  // Tax & Fee Settings
  const [taxSettings, setTaxSettings] = useState({ taxName: 'GST / Sales Tax', taxRate: 16, serviceFeeRate: 5, isTaxEnabled: true, ntnNumber: '7920143-5' });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.get(`/rooms/search?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guestsCount=${guestsCount}`);
      setAvailableRooms(data);
      if (e) {
        setTimeout(() => {
          scrollToSection('search-rooms');
        }, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    api.get('/settings/tax').then(res => { if (res) setTaxSettings(res); }).catch(console.error);

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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Static Gallery Data
  const galleryItems = [
    {
      id: 1,
      category: 'suites',
      title: 'Presidential Ocean Suite',
      description: 'Panoramic balcony view with king bed & marble bathroom.',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      category: 'dining',
      title: 'The Golden Palm Restaurant',
      description: 'Michelin-inspired Pakistani and international gourmet cuisines.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      category: 'amenities',
      title: 'Rooftop Infinity Pool',
      description: 'Heated infinity pool with sunset cocktail lounge access.',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      category: 'suites',
      title: 'Deluxe Executive Suite',
      description: 'Spacious ergonomic workspace with high-speed fiber Wi-Fi.',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      category: 'amenities',
      title: 'Serene Spa & Wellness Sanctuary',
      description: 'Aromatherapy massages, sauna, and rejuvenating hydrotherapy.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 6,
      category: 'dining',
      title: 'Grand Velvet Lounge Bar',
      description: 'Artisanal coffee, handcrafted teas, and evening mocktails.',
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const filteredGallery = activeGalleryTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeGalleryTab);

  return (
    <div style={{ background: '#ffffff', color: '#0f172a' }}>
      
      {/* 1. HERO BANNER SECTION */}
      <section style={{
        position: 'relative',
        padding: '100px 24px 80px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.04) 0%, rgba(217, 119, 6, 0.04) 100%), #ffffff',
        borderBottom: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(5, 150, 105, 0.1)',
            color: '#059669',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '24px'
          }}>
            <Star size={16} fill="#059669" /> 5-Star Luxury Resort & Hotel Experience
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.6rem, 5vw, 4rem)', 
            fontWeight: '800', 
            letterSpacing: '-0.03em', 
            lineHeight: 1.15, 
            marginBottom: '20px', 
            color: '#0f172a' 
          }}>
            Experience Unrivaled Luxury & Comfort at <span className="text-gradient">CareHaven Hotel</span>
          </h1>

          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '720px', 
            margin: '0 auto 36px auto', 
            lineHeight: 1.6 
          }}>
            Welcome to Pakistan's premier hospitality destination. Immerse yourself in refined luxury, exquisite dining, world-class spa facilities, and effortless online room booking.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '50px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => scrollToSection('search-rooms')}
              style={{ padding: '14px 32px', fontSize: '1.05rem', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.25)' }}
            >
              <Calendar size={18} /> Book Now (PKR Rates)
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={() => scrollToSection('about-hotel')}
              style={{ padding: '14px 32px', fontSize: '1.05rem', background: '#ffffff' }}
            >
              <Compass size={18} /> Explore Hotel Facilities
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)' }}>150+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Luxury Suites & Rooms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#d97706' }}>4.9 ★</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Guest Satisfaction</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)' }}>24/7</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Concierge & Room Service</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#d97706' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Instant Reservation Sync</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ABOUT HOTEL & AMENITIES SECTION */}
      <section id="about-hotel" style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              About <span className="text-gradient">CareHaven Hotel</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
              Designed for discerning business executives and leisure travelers seeking serene luxury, modern amenities, and warm traditional Pakistani hospitality.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* Left Content */}
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                World-Class Facilities Tailored for Extraordinary Stays
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '24px' }}>
                Located in the heart of Clifton's coastal breeze, CareHaven Hotel offers lavishly designed rooms featuring smart temperature control, ergonomic work centers, plush bedding, and high-speed fiber internet.
              </p>

              {/* Amenity Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <Wifi color="#059669" size={20} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>High-Speed Wi-Fi</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unlimited Ultra-Fast Fiber</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <Utensils color="#d97706" size={20} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Gourmet Dining</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>24-Hour Room Service</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <Waves color="#059669" size={20} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Infinity Pool & Spa</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Heated Pool & Sauna</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <ShieldCheck color="#d97706" size={20} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>24/7 Security</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Keycard Access & Guarded</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Card Highlight */}
            <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 40px rgba(5, 150, 105, 0.2)' }}>
              <Award size={36} style={{ marginBottom: '16px', color: '#fef08a' }} />
              <h4 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px', color: '#ffffff' }}>
                Why Guests Choose CareHaven
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} color="#fef08a" /> Transparent PKR pricing with zero hidden surcharges
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} color="#fef08a" /> Instant booking confirmation & paperless check-in
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} color="#fef08a" /> Flexible payment options (Pay at hotel or online)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} color="#fef08a" /> Daily housekeeping & dedicated guest concierge
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PHOTO GALLERY SECTION */}
      <section id="hotel-gallery" style={{ padding: '80px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              Hotel <span className="text-gradient">Photo Gallery</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Explore the elegance of our suites, fine dining spaces, and relaxing amenities.
            </p>

            {/* Gallery Filter Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
              {['all', 'suites', 'dining', 'amenities'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveGalleryTab(tab)}
                  className="btn"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    background: activeGalleryTab === tab ? 'var(--accent-primary)' : '#ffffff',
                    color: activeGalleryTab === tab ? '#ffffff' : '#475569',
                    border: activeGalleryTab === tab ? 'none' : '1px solid #cbd5e1'
                  }}
                >
                  {tab === 'all' ? 'All Photos' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Image Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredGallery.map(item => (
              <div 
                key={item.id} 
                className="glass-panel" 
                style={{ 
                  overflow: 'hidden', 
                  borderRadius: '16px', 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
                />
                <div style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. HOTEL LOCATION & CONTACT SECTION */}
      <section id="hotel-location" style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              Location & <span className="text-gradient">Contact Information</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Conveniently situated in Karachi's prime coastal business & shopping boulevard.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            
            {/* Left Contact Card */}
            <div className="glass-panel" style={{ padding: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
                Reach Out to Our Concierge
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Hotel Address</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      102 Luxury Boulevard, Phase 8 Clifton, Karachi, Pakistan
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Phone & Reservations</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      +92 21 111 227 342 / +92 300 8291000
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Email Inquiries</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      reservations@carehavenhotel.com
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Operating Hours</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      Reception & Check-in: 24/7 Open Daily
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Nearby Attractions / Location Highlights */}
            <div className="glass-panel" style={{ padding: '32px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
                Nearby Key Landmarks
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Clifton Sea View Beach</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scenic coastal promenade</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>
                    5 Mins
                  </span>
                </div>

                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Dolmen Shopping Mall</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>International brand shopping & food court</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>
                    8 Mins
                  </span>
                </div>

                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Jinnah International Airport</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Direct highway airport transfer</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', fontSize: '0.8rem', fontWeight: '700' }}>
                    25 Mins
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. LIVE ROOM SEARCH & RESERVATION ENGINE SECTION */}
      <section id="search-rooms" style={{ padding: '80px 24px', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Search & <span className="text-gradient">Book Rooms Online</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Select your check-in dates and reserve available accommodations instantly with PKR pricing.
            </p>
          </div>

          {/* Search Bar */}
          <div className="glass-panel" style={{ maxWidth: '950px', margin: '0 auto 50px auto', padding: '24px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Guests
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>
                <Search size={18} /> Search Available Rooms
              </button>
            </form>
          </div>

          {/* Available Rooms Grid */}
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>
            Available Accommodations ({availableRooms.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Checking live room availability...</div>
          ) : availableRooms.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              No rooms available for the selected dates. Please try different check-in/out dates.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
              {availableRooms.map(room => (
                <div key={room._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                  {room.roomType?.photos?.[0] ? (
                    <img src={room.roomType.photos[0]} alt={room.roomType.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '220px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>
                      Room {room.roomNumber}
                    </div>
                  )}

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a' }}>{room.roomType?.name}</h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room {room.roomNumber} • Floor {room.floor}</div>
                        </div>
                        {(() => {
                          const baseRate = room.roomType?.basePrice || 0;
                          const totalTaxPct = taxSettings.isTaxEnabled ? ((taxSettings.taxRate || 0) + (taxSettings.serviceFeeRate || 0)) : 0;
                          const priceWithTax = Math.round(baseRate * (1 + totalTaxPct / 100));
                          return (
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                                PKR {priceWithTax.toLocaleString()}
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}> / night</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                                ✔ Price Incl. Tax & Service
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                                (Base PKR {baseRate.toLocaleString()} + {totalTaxPct}% Taxes)
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        {room.roomType?.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {room.roomType?.amenities?.map((a, i) => (
                          <span key={i} style={{ padding: '4px 10px', borderRadius: '12px', background: '#f1f5f9', fontSize: '0.75rem', color: '#334155', border: '1px solid #cbd5e1' }}>
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

        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '50px 24px 30px 24px', borderTop: '1px solid #1e293b' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', marginBottom: '12px' }}>
              Care<span style={{ color: '#059669' }}>Haven</span> Hotel
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              Pakistan's luxury hotel experience. Committed to exceptional hospitality, seamless room management, and elegant customer care.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', marginBottom: '14px' }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <span onClick={() => scrollToSection('about-hotel')} style={{ cursor: 'pointer', hover: { color: '#fff' } }}>About Us</span>
              <span onClick={() => scrollToSection('hotel-gallery')} style={{ cursor: 'pointer' }}>Photo Gallery</span>
              <span onClick={() => scrollToSection('hotel-location')} style={{ cursor: 'pointer' }}>Location & Contact</span>
              <span onClick={() => scrollToSection('search-rooms')} style={{ cursor: 'pointer' }}>Book Rooms</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', marginBottom: '14px' }}>Guest Assistance</h4>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
              <div>24/7 Helpline: +92 21 111 227 342</div>
              <div>Email: reservations@carehavenhotel.com</div>
              <div>Location: Clifton Phase 8, Karachi</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', paddingTop: '20px', borderTop: '1px solid #1e293b', color: '#64748b' }}>
          © {new Date().getFullYear()} CareHaven Hotel System. All rights reserved. Currency rates presented in PKR.
        </div>
      </footer>

      {/* Online Reservation Checkout Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', borderRadius: '18px' }}>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Clock size={36} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px', color: '#0f172a' }}>Reservation Request Received!</h2>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', background: '#fffbe6', color: '#d97706', border: '1px solid #fde68a', fontWeight: '700', fontSize: '0.8rem', marginBottom: '12px' }}>
                  ⏳ Pending Hotel Confirmation
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', fontWeight: '800', marginBottom: '14px' }}>
                  Booking Ref: {bookingSuccess.bookingCode}
                </div>

                {/* Complete Bill Summary Box */}
                <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>OFFICIAL BILLING RECEIPT</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>NTN: {taxSettings.ntnNumber || '7920143-5'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Guest:</span>
                    <span style={{ fontWeight: '600' }}>{name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Room:</span>
                    <span style={{ fontWeight: '600' }}>Room {selectedRoom.roomNumber} ({selectedRoom.roomType?.name})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Dates:</span>
                    <span style={{ fontWeight: '600' }}>{checkInDate} to {checkOutDate}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Base Stay Charge:</span>
                      <span>PKR {(bookingSuccess.totalAmount ? Math.round(bookingSuccess.totalAmount / 1.21) : (selectedRoom.roomType?.basePrice || 0)).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Taxes & Service Fee ({taxSettings.isTaxEnabled ? (taxSettings.taxRate + taxSettings.serviceFeeRate) : 0}%):</span>
                      <span>PKR {(bookingSuccess.totalAmount ? (bookingSuccess.totalAmount - Math.round(bookingSuccess.totalAmount / 1.21)) : 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0f172a', fontSize: '0.95rem', paddingTop: '4px', borderTop: '1px solid #cbd5e1', marginTop: '2px' }}>
                      <span>Grand Total Amount:</span>
                      <span style={{ color: 'var(--accent-primary)' }}>PKR {(bookingSuccess.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => window.print()}>
                    <Printer size={16} /> Print Request Slip
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px', color: '#0f172a' }}>
                  Complete Reservation
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Room {selectedRoom?.roomNumber} ({selectedRoom?.roomType?.name})
                </div>

                {bookingError && (
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500' }}>
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleConfirmReservation} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Email</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Phone</label>
                      <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Payment Option</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}>
                      <option value="pay_at_hotel">Pay at Hotel</option>
                      <option value="card">Credit / Debit Card (Online Tokenized)</option>
                      <option value="online">Local Online Wallet (JazzCash / EasyPaisa)</option>
                    </select>
                  </div>

                  {/* Complete Bill Summary Breakdown Box */}
                  {(() => {
                    const start = new Date(checkInDate);
                    const end = new Date(checkOutDate);
                    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
                    const basePrice = selectedRoom?.roomType?.basePrice || 0;
                    const baseTotal = basePrice * diffDays;
                    const taxAmount = taxSettings.isTaxEnabled ? Math.round(baseTotal * ((taxSettings.taxRate || 16) / 100)) : 0;
                    const serviceFee = taxSettings.isTaxEnabled ? Math.round(baseTotal * ((taxSettings.serviceFeeRate || 5) / 100)) : 0;
                    const grandTotal = baseTotal + taxAmount + serviceFee;

                    return (
                      <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '2px 0' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🧾 Complete Bill Breakdown ({diffDays} Night{diffDays > 1 ? 's' : ''})</span>
                          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600' }}>FBR NTN: {taxSettings.ntnNumber || '7920143-5'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#334155' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Room Stay ({diffDays} night(s) @ PKR {basePrice.toLocaleString()}):</span>
                            <span>PKR {baseTotal.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{taxSettings.taxName || 'GST / Sales Tax'} ({taxSettings.isTaxEnabled ? taxSettings.taxRate : 0}%):</span>
                            <span>PKR {taxAmount.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Service Charge ({taxSettings.isTaxEnabled ? taxSettings.serviceFeeRate : 0}%):</span>
                            <span>PKR {serviceFee.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0f172a', fontSize: '0.95rem', paddingTop: '6px', borderTop: '1px solid #cbd5e1', marginTop: '2px' }}>
                            <span>Grand Total Payable:</span>
                            <span style={{ color: 'var(--accent-primary)' }}>PKR {grandTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Special Requests</label>
                    <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Early check-in, extra bed, high floor..." style={{ width: '100%', height: '55px', padding: '8px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
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
