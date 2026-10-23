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
  BedDouble,
  Search,
  CheckCircle2,
  AlertTriangle
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
        { id: Date.now(), text: `New reservation ${booking.bookingCode} created via ${booking.source}`, type: 'booking', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.slice(0, 9)
      ]);
    }

    function onRoomStatusChanged({ roomId, status }) {
      fetchDashboardData();
      setActivityFeed(prev => [
        { id: Date.now(), text: `Room occupancy status shifted to '${status}'`, type: 'room', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.slice(0, 9)
      ]);
    }

    function onCleaningUpdated({ roomId, cleaningStatus }) {
      fetchDashboardData();
      setActivityFeed(prev => [
        { id: Date.now(), text: `Housekeeping turnover updated to '${cleaningStatus}'`, type: 'cleaning', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', label: 'Available' };
      case 'Occupied':
        return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'Occupied' };
      case 'Reserved':
        return { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: 'Reserved' };
      case 'Under Maintenance':
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', label: 'Maintenance' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', label: status };
    }
  };

  const getCleaningBadge = (status) => {
    switch (status) {
      case 'Clean':
        return { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', label: 'Clean / Ready' };
      case 'Dirty':
        return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'Turnaround' };
      case 'In Progress':
        return { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: 'Cleaning' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Pending' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        Loading property management dashboard...
      </div>
    );
  }

  const roomCounts = {
    ALL: rooms.length,
    Available: rooms.filter(r => r.status === 'Available').length,
    Occupied: rooms.filter(r => r.status === 'Occupied').length,
    Reserved: rooms.filter(r => r.status === 'Reserved').length,
    'Under Maintenance': rooms.filter(r => r.status === 'Under Maintenance').length
  };

  return (
    <div className="container" style={{ padding: '24px 24px 40px 24px', maxWidth: '1400px' }}>
      {/* Top Header */}
      <div className="responsive-header" style={{ marginBottom: '18px' }}>
        <div>
          <div className="page-eyebrow">Front Office Operations</div>
          <h1 className="page-title">
            Property Overview
          </h1>
          <p className="page-subtitle">
            Real-time occupancy status, room turnover readiness, and financial metrics
          </p>
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={fetchDashboardData}
        >
          <RefreshCw size={13} /> Refresh Metrics
        </button>
      </div>

      {/* Unified Operational Strip (Replaces bloated AI floating cards) */}
      <div className="pms-stat-strip">
        {/* Metric 1: Revenue */}
        <div className="pms-stat-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Gross Revenue
            </span>
            <DollarSign size={15} style={{ color: '#0b5e39' }} />
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
            PKR {metrics?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0b5e39', fontWeight: 500 }}>
            Invoiced & payment ledger settled
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="pms-stat-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Occupancy Rate
            </span>
            <Percent size={15} style={{ color: '#1d4ed8' }} />
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
            {metrics?.occupancyRate || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {metrics?.occupiedRooms + metrics?.reservedRooms} of {metrics?.totalRooms} active keys assigned
          </div>
        </div>

        {/* Metric 3: Active Bookings */}
        <div className="pms-stat-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Active Reservations
            </span>
            <CalendarCheck size={15} style={{ color: '#475569' }} />
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
            {metrics?.totalBookings || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ color: '#0b5e39', fontWeight: 600 }}>{metrics?.confirmedBookings} Confirmed</span> • <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{metrics?.checkedInBookings} In-House</span>
          </div>
        </div>

        {/* Metric 4: Housekeeping */}
        <div className="pms-stat-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Turnaround Inspection
            </span>
            <Sparkles size={15} style={{ color: metrics?.dirtyRooms > 0 ? '#b91c1c' : '#0b5e39' }} />
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, color: metrics?.dirtyRooms > 0 ? '#b91c1c' : '#0f172a', margin: '4px 0 2px 0' }}>
            {metrics?.dirtyRooms || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: metrics?.dirtyRooms > 0 ? '#b91c1c' : '#0b5e39', fontWeight: 500 }}>
            {metrics?.dirtyRooms > 0 ? 'Pending housekeeping turnover' : '✓ All rooms inspected & ready'}
          </div>
        </div>
      </div>

      {/* Live Room Rack / Matrix */}
      <div className="pms-card" style={{ padding: '20px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Live Room Rack
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
              Key inventory, occupancy states, and housekeeping turnover readiness
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search key # or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '30px',
                height: '32px',
                fontSize: '0.8125rem'
              }}
            />
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          {[
            { id: 'ALL', label: 'All Keys', count: roomCounts.ALL },
            { id: 'Available', label: 'Available', count: roomCounts.Available },
            { id: 'Occupied', label: 'Occupied', count: roomCounts.Occupied },
            { id: 'Reserved', label: 'Reserved', count: roomCounts.Reserved },
            { id: 'Under Maintenance', label: 'Maintenance', count: roomCounts['Under Maintenance'] }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '5px',
                  border: '1px solid',
                  borderColor: isActive ? '#0b5e39' : '#e2e8f0',
                  background: isActive ? '#0b5e39' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab.label}
                <span className="font-mono" style={{
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Room Rack Grid */}
        {filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8', fontSize: '0.8125rem' }}>
            No rooms found matching '{statusFilter}' or search query.
          </div>
        ) : (
          <div className="grid-cols-3" style={{ gap: '12px' }}>
            {filteredRooms.map((room) => {
              const badge = getStatusBadge(room.status);
              const cleanBadge = getCleaningBadge(room.cleaningStatus);

              return (
                <div key={room._id} style={{
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  {/* Top Bar: Room # & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '5px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BedDouble size={14} />
                      </div>
                      <div>
                        <div className="font-mono tabular-nums" style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                          Room {room.roomNumber}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          Floor {room.floor} • {room.roomType?.name || 'Standard'}
                        </div>
                      </div>
                    </div>

                    <span className="pms-badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Price & Cleaning Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '4px' }}>
                    <span className="font-mono tabular-nums" style={{ color: '#0b5e39', fontWeight: 600 }}>
                      PKR {room.roomType?.basePrice?.toLocaleString() || '0'}<span style={{ color: '#94a3b8', fontWeight: 400 }}>/night</span>
                    </span>
                    <span className="pms-badge" style={{ background: cleanBadge.bg, color: cleanBadge.color, border: `1px solid ${cleanBadge.border}` }}>
                      {cleanBadge.label}
                    </span>
                  </div>

                  {/* Quick Action Footer */}
                  {hasPermission('rooms', 'edit') && (
                    <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <select
                        value={room.status}
                        onChange={(e) => handleQuickStatusChange(room._id, e.target.value)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: '#0f172a',
                          background: '#f8fafc',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Under Maintenance">Maintenance</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Booking Channel Distribution & Live Audit Trail */}
      <div className="grid-cols-2" style={{ gap: '16px' }}>
        {/* Booking Channels */}
        <div className="pms-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Layers size={16} style={{ color: '#0b5e39' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
              Channel Distribution
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Online Guest Portal', count: metrics?.sourceBreakdown?.portal || 0, color: '#0b5e39' },
              { label: 'Front-Desk Walk-Ins', count: metrics?.sourceBreakdown?.walkIn || 0, color: '#b45309' },
              { label: 'Phone Reservations', count: metrics?.sourceBreakdown?.phone || 0, color: '#1d4ed8' }
            ].map((channel, i) => {
              const total = metrics?.totalBookings || 1;
              const pct = total ? Math.round((channel.count / total) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', color: '#0f172a' }}>
                    <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: channel.color }} />
                      {channel.label}
                    </span>
                    <span className="font-mono tabular-nums" style={{ fontWeight: 600, color: '#0f172a' }}>
                      {channel.count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: channel.color, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-Time Operational Log */}
        <div className="pms-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#64748b' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                Operational Log
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#0b5e39', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Live Feed
            </div>
          </div>

          {activityFeed.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center', padding: '28px 0' }}>
              Listening for real-time PMS events (check-ins, bookings, room turnovers)...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {activityFeed.map(item => (
                <div key={item.id} style={{
                  padding: '7px 10px',
                  borderRadius: '5px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem'
                }}>
                  <span style={{ color: '#334155' }}>{item.text}</span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '10px', flexShrink: 0 }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
