import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHousekeeping = async () => {
    try {
      const data = await api.get('/housekeeping');
      setRooms(data.rooms || []);
      setLogs(data.logs || []);
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

  const getCleanDetails = (status) => {
    switch (status) {
      case 'Clean':
        return { bg: '#f0fdf4', color: '#166534', dot: '#16a34a', label: 'Clean / Ready' };
      case 'Dirty':
        return { bg: '#fef2f2', color: '#991b1b', dot: '#dc2626', label: 'Turnaround Needed' };
      case 'In Progress':
        return { bg: '#fffbeb', color: '#92400e', dot: '#d97706', label: 'In Progress' };
      default:
        return { bg: '#f4f4f5', color: '#52525b', dot: '#71717a', label: status };
    }
  };

  return (
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1380px' }}>
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">Housekeeping & Operations</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.025em' }}>
            Housekeeping
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.84rem', marginTop: '2px' }}>
            Room cleanliness inspection, turnover tracking, and staff readiness
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchHousekeeping}
          style={{ fontSize: '0.82rem', padding: '7px 12px' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa', fontSize: '0.85rem' }}>
          Loading housekeeping operational queue...
        </div>
      ) : (
        <div className="grid-cols-3" style={{ gap: '14px', marginBottom: '40px' }}>
          {rooms.map(room => {
            const cleanInfo = getCleanDetails(room.cleaningStatus);
            return (
              <div key={room._id} className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#09090b' }}>
                      Room {room.roomNumber}
                    </h3>
                    <span className="status-pill" style={{ background: cleanInfo.bg, color: cleanInfo.color, border: '1px solid rgba(0,0,0,0.04)' }}>
                      <span className="status-dot" style={{ background: cleanInfo.dot }} />
                      {cleanInfo.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#71717a', marginBottom: '16px' }}>
                    {room.roomType?.name || 'Standard'} • Floor {room.floor}
                  </div>
                </div>

                {hasPermission('housekeeping', 'edit') ? (
                  <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    {[
                      { id: 'Clean', label: 'Clean', activeBg: '#eaf6f0', activeColor: '#065f46', activeBorder: '#059669' },
                      { id: 'In Progress', label: 'Progress', activeBg: '#fffbeb', activeColor: '#92400e', activeBorder: '#d97706' },
                      { id: 'Dirty', label: 'Turnaround', activeBg: '#fef2f2', activeColor: '#991b1b', activeBorder: '#dc2626' }
                    ].map(st => {
                      const isCurrent = room.cleaningStatus === st.id;
                      return (
                        <button
                          key={st.id}
                          className="btn"
                          onClick={() => handleCleaningChange(room._id, st.id)}
                          style={{
                            flex: 1,
                            fontSize: '0.74rem',
                            padding: '6px 8px',
                            background: isCurrent ? st.activeBg : '#ffffff',
                            color: isCurrent ? st.activeColor : '#64748b',
                            border: '1px solid',
                            borderColor: isCurrent ? st.activeBorder : '#e2e8f0',
                            fontWeight: isCurrent ? 700 : 500,
                            borderRadius: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #f4f4f5' }}>
                    Read-only housekeeping view
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
