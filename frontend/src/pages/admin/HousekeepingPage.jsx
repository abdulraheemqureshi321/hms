import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
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

  const { hasPermission } = useAuth();

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
            Housekeeping <span className="text-gradient">Task Center</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Real-time room cleanliness tracking and turnover logging
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {rooms.map(room => (
          <div key={room._id} className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Room {room.roomNumber}</h3>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                background: room.cleaningStatus === 'Clean' ? 'rgba(5, 150, 105, 0.1)' : room.cleaningStatus === 'Dirty' ? 'rgba(225, 29, 72, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                color: room.cleaningStatus === 'Clean' ? '#059669' : room.cleaningStatus === 'Dirty' ? '#e11d48' : '#d97706'
              }}>
                {room.cleaningStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Category: {room.roomType?.name} • Floor {room.floor}
            </div>

            {hasPermission('housekeeping', 'edit') ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCleaningChange(room._id, 'Clean')}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px', background: room.cleaningStatus === 'Clean' ? 'rgba(5,150,105,0.15)' : undefined }}
                >
                  Mark Clean
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCleaningChange(room._id, 'In Progress')}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px', background: room.cleaningStatus === 'In Progress' ? 'rgba(217,119,6,0.15)' : undefined }}
                >
                  In Progress
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCleaningChange(room._id, 'Dirty')}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px', background: room.cleaningStatus === 'Dirty' ? 'rgba(225,29,72,0.15)' : undefined }}
                >
                  Mark Dirty
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
                Read-only housekeeping view
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
