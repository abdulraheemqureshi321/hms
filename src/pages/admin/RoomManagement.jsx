import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BedDouble, Plus, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Room Form
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [floor, setFloor] = useState('1');

  const fetchData = async () => {
    try {
      const [rData, tData] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/types')
      ]);
      setRooms(rData);
      setRoomTypes(tData);
      if (tData.length > 0) setSelectedType(tData[0]._id);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        roomNumber,
        roomType: selectedType,
        floor: parseInt(floor),
        status: 'Available',
        cleaningStatus: 'Clean'
      });
      setShowRoomModal(false);
      setRoomNumber('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create room');
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await api.put(`/rooms/${roomId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Room & <span className="text-gradient">Inventory Control</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage room status, floor assignments, and room type specifications
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRoomModal(true)}>
          <Plus size={16} /> Add New Room
        </button>
      </div>

      {/* Room Types Overview */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BedDouble size={18} color="var(--accent-primary)" /> Configured Room Categories
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {roomTypes.map(t => (
          <div key={t._id} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{t.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Capacity: {t.capacity} Person(s)</div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>
                ${t.basePrice}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/night</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '12px 0' }}>{t.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {t.amenities?.map((a, i) => (
                <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rooms Directory */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Individual Rooms Directory</h2>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>ROOM NO.</th>
              <th style={{ padding: '12px' }}>CATEGORY</th>
              <th style={{ padding: '12px' }}>FLOOR</th>
              <th style={{ padding: '12px' }}>OPERATIONAL STATUS</th>
              <th style={{ padding: '12px' }}>CLEANING STATE</th>
              <th style={{ padding: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px', fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>
                  Room {room.roomNumber}
                </td>
                <td style={{ padding: '16px 12px' }}>{room.roomType?.name || 'Standard'}</td>
                <td style={{ padding: '16px 12px' }}>Floor {room.floor}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: room.status === 'Available' ? 'rgba(34, 197, 94, 0.15)' : room.status === 'Occupied' ? 'rgba(239, 68, 68, 0.15)' : room.status === 'Reserved' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: room.status === 'Available' ? '#4ade80' : room.status === 'Occupied' ? '#f87171' : room.status === 'Reserved' ? '#c084fc' : '#fbbf24'
                  }}>
                    {room.status}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: room.cleaningStatus === 'Clean' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: room.cleaningStatus === 'Clean' ? '#4ade80' : '#f87171'
                  }}>
                    {room.cleaningStatus}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room._id, e.target.value)}
                    style={{ padding: '6px 10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Room */}
      {showRoomModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Add Room to Inventory</h2>
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room Category</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                >
                  {roomTypes.map(t => (
                    <option key={t._id} value={t._id}>{t.name} (${t.basePrice}/night)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Floor Number</label>
                <input
                  type="number"
                  required
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
