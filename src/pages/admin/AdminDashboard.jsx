import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
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
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState([]);

  const fetchMetrics = async () => {
    try {
      const data = await api.get('/reports/dashboard');
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Listen to real-time events broadcast from server
    function onBookingCreated(booking) {
      fetchMetrics();
      setActivityFeed(prev => [
        { id: Date.now(), text: `New booking (${booking.bookingCode}) created via ${booking.source}`, type: 'booking', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }

    function onRoomStatusChanged({ roomId, status }) {
      fetchMetrics();
      setActivityFeed(prev => [
        { id: Date.now(), text: `Room status updated to '${status}'`, type: 'room', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }

    function onCleaningUpdated({ roomId, cleaningStatus }) {
      fetchMetrics();
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

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard Analytics...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      {/* Header Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            System <span className="text-gradient">Overview</span> & Real-time Metrics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Live status of room occupancy, revenue analytics, and housekeeping
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchMetrics}>
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* Primary KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Total Revenue */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff' }}>
            ${metrics?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> Real-time payment accruals
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Occupancy Rate</span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
              <Percent size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff' }}>
            {metrics?.occupancyRate || 0}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {metrics?.occupiedRooms + metrics?.reservedRooms} of {metrics?.totalRooms} rooms reserved/occupied
          </div>
        </div>

        {/* Total Bookings */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Reservations</span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc' }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff' }}>
            {metrics?.totalBookings || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {metrics?.confirmedBookings} Confirmed • {metrics?.checkedInBookings} Checked In
          </div>
        </div>

        {/* Housekeeping Action Required */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Dirty Rooms</span>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff' }}>
            {metrics?.dirtyRooms || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '6px' }}>
            Needs housekeeping turn-around
          </div>
        </div>
      </div>

      {/* Grid Section: Booking Source Breakdown & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Booking Source Breakdown */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-primary)" /> Reservation Source Channels
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>Online Guest Portal</span>
                <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.portal || 0} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${metrics?.totalBookings ? (metrics.sourceBreakdown.portal / metrics.totalBookings) * 100 : 0}%`, background: 'var(--accent-gradient)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>Front-Desk Walk-Ins</span>
                <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.walkIn || 0} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${metrics?.totalBookings ? (metrics.sourceBreakdown.walkIn / metrics.totalBookings) * 100 : 0}%`, background: '#3b82f6', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>Phone Reservations</span>
                <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.phone || 0} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${metrics?.totalBookings ? (metrics.sourceBreakdown.phone / metrics.totalBookings) * 100 : 0}%`, background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Socket Activity Feed */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-secondary)" /> Live Real-Time Event Feed
          </h3>

          {activityFeed.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>
              Listening for live WebSocket events (bookings, check-ins, housekeeping)...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
              {activityFeed.map(item => (
                <div key={item.id} style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.text}</span>
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
