import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { BedDouble, Plus, Edit3, Trash2, Upload, Image as ImageIcon, CheckCircle2, DollarSign, Users, Sparkles, X } from 'lucide-react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New/Edit Room State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [floor, setFloor] = useState('1');

  // Room Type Category & Price State
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [basePrice, setBasePrice] = useState('150');
  const [capacity, setCapacity] = useState('2');
  const [description, setDescription] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const [rData, tData] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/types')
      ]);
      setRooms(rData);
      setRoomTypes(tData);
      if (tData.length > 0 && !selectedType) setSelectedType(tData[0]._id);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('room_status_changed', fetchData);
    socket.on('room_cleaning_updated', fetchData);
    socket.on('booking_created', fetchData);
    socket.on('booking_updated', fetchData);

    return () => {
      socket.off('room_status_changed', fetchData);
      socket.off('room_cleaning_updated', fetchData);
      socket.off('booking_created', fetchData);
      socket.off('booking_updated', fetchData);
    };
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        roomNumber,
        roomType: selectedType,
        floor: parseInt(floor) || 1,
        status: 'Available',
        cleaningStatus: 'Clean'
      });
      setShowRoomModal(false);
      setRoomNumber('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setErrorMsg('');

    try {
      const data = await api.post('/rooms/upload', formData);
      setUploadedPhotos([...uploadedPhotos, data.url]);
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const amenities = amenitiesInput
      ? amenitiesInput.split(',').map(a => a.trim()).filter(Boolean)
      : ['WiFi', 'Air Conditioning', 'Flat TV'];

    const typeData = {
      name: typeName,
      basePrice: parseFloat(basePrice),
      capacity: parseInt(capacity),
      description,
      amenities,
      photos: uploadedPhotos
    };

    try {
      if (editingType) {
        await api.put(`/rooms/types/${editingType._id}`, typeData);
      } else {
        await api.post('/rooms/types', typeData);
      }
      setShowTypeModal(false);
      setEditingType(null);
      setTypeName('');
      setUploadedPhotos([]);
      setAmenitiesInput('');
      fetchData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1400px' }}>
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            Room & <span className="text-gradient">Category Inventory</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage room numbers, dynamic pricing tiers, capacity limits, and photo galleries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setEditingType(null);
              setTypeName('');
              setBasePrice('150');
              setCapacity('2');
              setDescription('');
              setAmenitiesInput('');
              setUploadedPhotos([]);
              setShowTypeModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> New Room Category
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowRoomModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BedDouble size={18} /> Add Room Number
          </button>
        </div>
      </div>

      {/* Room Categories Summary Cards */}
      <div className="grid-cols-3" style={{ gap: '20px', marginBottom: '32px' }}>
        {roomTypes.map((type) => (
          <div key={type._id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{type.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capacity: {type.capacity} Guests</span>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                ${type.basePrice}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/night</span>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {type.description || 'Spacious, elegantly furnished guest room featuring modern amenities and room service.'}
            </p>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {type.amenities?.map((a, i) => (
                <span key={i} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569' }}>
                  {a}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setEditingType(type);
                  setTypeName(type.name);
                  setBasePrice(type.basePrice);
                  setCapacity(type.capacity);
                  setDescription(type.description || '');
                  setAmenitiesInput(type.amenities ? type.amenities.join(', ') : '');
                  setUploadedPhotos(type.photos || []);
                  setShowTypeModal(true);
                }}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <Edit3 size={14} style={{ marginRight: '6px' }} /> Edit Category
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Room Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Rooms...</div>
      ) : (
        <div className="table-responsive">
          <table className="glass-panel" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ROOM #</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>FLOOR</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CATEGORY</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>NIGHTLY RATE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>OPERATIONAL STATUS</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CLEANING STATUS</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Room {room.roomNumber}</td>
                  <td style={{ padding: '16px' }}>Floor {room.floor}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{room.roomType?.name || 'Standard'}</td>
                  <td style={{ padding: '16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    ${room.roomType?.basePrice || 150}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${
                      room.status === 'Available' ? 'badge-available' : 
                      room.status === 'Occupied' ? 'badge-occupied' : 
                      room.status === 'Reserved' ? 'badge-reserved' : 'badge-maintenance'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: room.cleaningStatus === 'Clean' ? '#d1fae5' : room.cleaningStatus === 'Dirty' ? '#fee2e2' : '#fef3c7',
                      color: room.cleaningStatus === 'Clean' ? '#065f46' : room.cleaningStatus === 'Dirty' ? '#991b1b' : '#92400e'
                    }}>
                      {room.cleaningStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleDeleteRoom(room._id)}
                      style={{ padding: '6px 12px', color: '#ef4444', borderColor: '#fca5a5' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', background: '#fff', padding: '32px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>Add New Room Number</h2>
            <form onSubmit={handleCreateRoom}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Room Number (e.g. 101, 102)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={roomNumber} 
                  onChange={(e) => setRoomNumber(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Room Category</label>
                <select 
                  className="input-field" 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)} 
                  required
                >
                  {roomTypes.map(t => (
                    <option key={t._id} value={t._id}>{t.name} (${t.basePrice}/night)</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Floor Number</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={floor} 
                  onChange={(e) => setFloor(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showTypeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
              {editingType ? 'Edit Room Category' : 'Create Room Category'}
            </h2>

            {errorMsg && (
              <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveType}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Category Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={typeName} 
                  onChange={(e) => setTypeName(e.target.value)} 
                  required 
                  placeholder="Executive Suite, Deluxe Room..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Base Price ($/night)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={basePrice} 
                    onChange={(e) => setBasePrice(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Guest Capacity</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea 
                  className="input-field" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={3}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Amenities (Comma Separated)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={amenitiesInput} 
                  onChange={(e) => setAmenitiesInput(e.target.value)} 
                  placeholder="WiFi, King Bed, Mini Bar, Ocean View"
                />
              </div>

              {/* Photo Upload via Cloudinary */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Room Photos</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ marginBottom: '12px' }} 
                />
                {uploadingImage && <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Uploading photo to Cloudinary...</div>}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {uploadedPhotos.map((url, idx) => (
                    <img key={idx} src={url} alt="Room" style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
