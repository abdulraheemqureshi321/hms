import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { Sparkles, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHousekeeping = async () => {
    try {
      const data = await api.get('/housekeeping');
      setRooms(data.rooms);
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousekeeping();

    socket.on('room_cleaning_updated', () => fetchHousekeeping());
    return () => socket.off('room_cleaning_updated');
  }, []);

  const handleCleaningChange = async (roomId, newStatus) => {
    try {
      await api.put(`/housekeeping/room/${roomId}`, { cleaningStatus: newStatus });
      fetchHousekeeping();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Housekeeping <span className="text-gradient">Task Center</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Real-time room cleanliness tracking and turnover logging
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {rooms.map(room => (
          <div key={room._id} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Room {room.roomNumber}</h3>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                background: room.cleaningStatus === 'Clean' ? 'rgba(34, 197, 94, 0.15)' : room.cleaningStatus === 'Dirty' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: room.cleaningStatus === 'Clean' ? '#4ade80' : room.cleaningStatus === 'Dirty' ? '#f87171' : '#fbbf24'
              }}>
                {room.cleaningStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Category: {room.roomType?.name} • Floor {room.floor}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleCleaningChange(room._id, 'Clean')}
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px', background: room.cleaningStatus === 'Clean' ? 'rgba(34,197,94,0.2)' : undefined }}
              >
                Mark Clean
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleCleaningChange(room._id, 'In Progress')}
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px', background: room.cleaningStatus === 'In Progress' ? 'rgba(245,158,11,0.2)' : undefined }}
              >
                In Progress
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleCleaningChange(room._id, 'Dirty')}
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px', background: room.cleaningStatus === 'Dirty' ? 'rgba(239,68,68,0.2)' : undefined }}
              >
                Mark Dirty
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
