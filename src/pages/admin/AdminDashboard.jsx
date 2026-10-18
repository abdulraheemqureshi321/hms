import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  CalendarCheck, 
  DollarSign, 
  Percent, 
  Layers, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState([]);

  // Room Status Filtering
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { hasPermission } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const [metricsData, roomsData] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/rooms')
      ]);
      setMetrics(metricsData);
      setRooms(roomsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time events broadcast from server
    function onBookingCreated(booking) {
      fetchDashboardData();
      setActivityFeed(prev => [
        { id: Date.now(), text: `New booking (${booking.bookingCode}) created via ${booking.source}`, type: 'booking', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }

    function onRoomStatusChanged({ roomId, status }) {
      fetchDashboardData();
      setActivityFeed(prev => [
        { id: Date.now(), text: `Room status updated to '${status}'`, type: 'room', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }

    function onCleaningUpdated({ roomId, cleaningStatus }) {
      fetchDashboardData();
      setActivityFeed(prev => [
        { id: Date.now(), text: `Housekeeping marked room cleaning as '${cleaningStatus}'`, type: 'cleaning', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }

    socket.on('booking_created', onBookingCreated);
    socket.on('room_status_changed', onRoomStatusChanged);
    socket.on('room_cleaning_updated', onCleaningUpdated);

    return () => {
      socket.off('booking_created', onBookingCreated);
      socket.off('room_status_changed', onRoomStatusChanged);
      socket.off('room_cleaning_updated', onCleaningUpdated);
    };
  }, []);

  const handleQuickStatusChange = async (roomId, newStatus) => {
    try {
      await api.put(`/rooms/${roomId}`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update room status');
    }
  };

  // Filter Rooms Logic
  const filteredRooms = rooms.filter(room => {
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      String(room.roomNumber).toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomType?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '#a7f3d0', icon: CheckCircle2 };
      case 'Occupied':
        return { bg: 'rgba(225, 29, 72, 0.12)', color: '#dc2626', border: '#fca5a5', icon: BedDouble };
      case 'Reserved':
        return { bg: 'rgba(217, 119, 6, 0.12)', color: '#d97706', border: '#fde68a', icon: CalendarCheck };
      case 'Under Maintenance':
        return { bg: 'rgba(147, 51, 234, 0.12)', color: '#9333ea', border: '#e9d5ff', icon: Wrench };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1', icon: AlertCircle };
    }
  };

  const getCleaningBadgeStyle = (status) => {
    switch (status) {
      case 'Clean':
        return { bg: '#f0fdf4', color: '#166534', label: '✨ Clean' };
      case 'Dirty':
        return { bg: '#fff1f2', color: '#9f1239', label: '🧹 Dirty' };
      case 'In Progress':
        return { bg: '#eff6ff', color: '#1e40af', label: '⏳ Cleaning' };
      default:
        return { bg: '#f8fafc', color: '#475569', label: 'N/A' };
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard Analytics...</div>;
  }

  const roomCounts = {
    ALL: rooms.length,
    Available: rooms.filter(r => r.status === 'Available').length,
    Occupied: rooms.filter(r => r.status === 'Occupied').length,
    Reserved: rooms.filter(r => r.status === 'Reserved').length,
    'Under Maintenance': rooms.filter(r => r.status === 'Under Maintenance').length
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1400px' }}>
      {/* Header Title & Refresh */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            System <span className="text-gradient">Overview</span> & Real-time Metrics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Live status of room occupancy, revenue analytics, and housekeeping
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData}>
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
        {/* Total Revenue */}
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Revenue</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            PKR {metrics?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <ArrowUpRight size={14} /> Real-time payment accruals
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Occupancy Rate</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <Percent size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.occupancyRate || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {metrics?.occupiedRooms + metrics?.reservedRooms} of {metrics?.totalRooms} rooms reserved/occupied
          </div>
        </div>

        {/* Total Bookings */}
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Reservations</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }}>
              <CalendarCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.totalBookings || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {metrics?.confirmedBookings} Confirmed • {metrics?.checkedInBookings} Checked In
          </div>
        </div>

        {/* Housekeeping Action Required */}
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dirty Rooms</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.dirtyRooms || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#e11d48', marginTop: '6px', fontWeight: '600' }}>
            Needs housekeeping turn-around
          </div>
        </div>
      </div>

      {/* Live Rooms Matrix */}
      <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--accent-primary)" /> Live Room Status Matrix
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time visual dashboard displaying all hotel rooms, current occupancy state, and housekeeping readiness.
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search room # or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
          {[
            { id: 'ALL', label: 'All Rooms', count: roomCounts.ALL, color: '#334155' },
            { id: 'Available', label: 'Available', count: roomCounts.Available, color: '#059669' },
            { id: 'Occupied', label: 'Occupied', count: roomCounts.Occupied, color: '#dc2626' },
            { id: 'Reserved', label: 'Reserved', count: roomCounts.Reserved, color: '#d97706' },
            { id: 'Under Maintenance', label: 'Maintenance', count: roomCounts['Under Maintenance'], color: '#9333ea' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: statusFilter === tab.id ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
                background: statusFilter === tab.id ? `${tab.color}15` : '#f8fafc',
                color: statusFilter === tab.id ? tab.color : '#64748b',
                fontWeight: statusFilter === tab.id ? '700' : '500',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
              <span style={{
                padding: '2px 6px',
                borderRadius: '10px',
                background: statusFilter === tab.id ? tab.color : '#e2e8f0',
                color: statusFilter === tab.id ? '#ffffff' : '#475569',
                fontSize: '0.7rem',
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Room Status Cards Grid */}
        {filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
            No rooms found matching status '{statusFilter}' or search query.
          </div>
        ) : (
          <div className="grid-cols-3">
            {filteredRooms.map((room) => {
              const badge = getStatusBadgeStyle(room.status);
              const cleanBadge = getCleaningBadgeStyle(room.cleaningStatus);
              const IconComp = badge.icon;

              return (
                <div key={room._id} style={{
                  borderRadius: '12px',
                  border: `1.5px solid ${badge.border}`,
                  background: '#ffffff',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s ease',
                  position: 'relative'
                }}>
                  {/* Top Bar: Room # & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: badge.color }}>
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                          Room {room.roomNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Floor {room.floor}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}>
                      {room.status}
                    </span>
                  </div>

                  {/* Room Details */}
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>
                      {room.roomType?.name || 'Standard Room'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      PKR {room.roomType?.basePrice?.toLocaleString() || '0'} / night
                    </div>
                  </div>

                  {/* Housekeeping & Change Status Footer */}
                  <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: cleanBadge.bg, color: cleanBadge.color, fontSize: '0.75rem', fontWeight: '600' }}>
                      {cleanBadge.label}
                    </span>

                    {/* Quick Status Setter */}
                    {hasPermission('rooms', 'edit') && (
                      <select
                        value={room.status}
                        onChange={(e) => handleQuickStatusChange(room._id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#0f172a',
                          background: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Under Maintenance">Maintenance</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid Section: Booking Source Breakdown & Activity Feed */}
      <div className="grid-cols-2">
        {/* Booking Source Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-primary)" /> Reservation Source Channels
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#0f172a' }}>
                <span>Online Guest Portal</span>
                <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.portal || 0} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${metrics?.totalBookings ? (metrics.sourceBreakdown.portal / metrics.totalBookings) * 100 : 0}%`, background: 'var(--accent-gradient)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#0f172a' }}>
                <span>Front-Desk Walk-Ins</span>
                <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.walkIn || 0} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${metrics?.totalBookings ? (metrics.sourceBreakdown.walkIn / metrics.totalBookings) * 100 : 0}%`, background: '#d97706', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#0f172a' }}>
                <span>Phone Reservations</span>
                <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.phone || 0} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${metrics?.totalBookings ? (metrics.sourceBreakdown.phone / metrics.totalBookings) * 100 : 0}%`, background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Socket Activity Feed */}
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-secondary)" /> Live Real-Time Event Feed
          </h3>

          {activityFeed.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
              Listening for live WebSocket events (bookings, check-ins, housekeeping)...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
              {activityFeed.map(item => (
                <div key={item.id} style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#0f172a' }}>{item.text}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
