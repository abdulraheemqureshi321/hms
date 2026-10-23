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
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1380px' }}>
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">Property Configuration</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.025em' }}>
            Rooms & Categories
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.84rem', marginTop: '2px' }}>
            Inventory of room keys, pricing tiers, guest capacity, and amenities
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            style={{ fontSize: '0.82rem', padding: '7px 12px' }}
          >
            <Plus size={14} /> New Category
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowRoomModal(true)}
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
          >
            <BedDouble size={14} /> Add Room Number
          </button>
        </div>
      </div>

      {/* Room Categories Summary Cards */}
      <div className="grid-cols-3" style={{ gap: '14px', marginBottom: '24px' }}>
        {roomTypes.map((type) => (
          <div key={type._id} className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em' }}>{type.name}</h3>
                  <span style={{ fontSize: '0.76rem', color: '#71717a' }}>Max {type.capacity} Guests</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 600, color: '#09090b' }}>
                  ${type.basePrice}<span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#a1a1aa' }}>/nt</span>
                </div>
              </div>
              
              <p style={{ color: '#52525b', fontSize: '0.8rem', marginBottom: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {type.description || 'Furnished guest room with modern hotel amenities.'}
              </p>

              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {type.amenities?.map((a, i) => (
                  <span key={i} style={{ fontSize: '0.7rem', background: '#f4f4f5', padding: '2px 7px', borderRadius: '4px', color: '#52525b' }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #f4f4f5' }}>
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
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
              >
                <Edit3 size={12} style={{ marginRight: '4px' }} /> Edit Category
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Room Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa', fontSize: '0.85rem' }}>Loading Rooms...</div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Floor</th>
                <th>Category</th>
                <th>Rate / Night</th>
                <th>Occupancy Status</th>
                <th>Housekeeping</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const getStatusPill = (st) => {
                  switch (st) {
                    case 'Available': return { bg: '#f0fdf4', color: '#166534', dot: '#16a34a' };
                    case 'Occupied': return { bg: '#fef2f2', color: '#991b1b', dot: '#dc2626' };
                    case 'Reserved': return { bg: '#fffbeb', color: '#92400e', dot: '#d97706' };
                    default: return { bg: '#f4f4f5', color: '#52525b', dot: '#71717a' };
                  }
                };
                const getCleanPill = (cl) => {
                  switch (cl) {
                    case 'Clean': return { bg: '#f0fdf4', color: '#166534', label: 'Clean / Ready' };
                    case 'Dirty': return { bg: '#fef2f2', color: '#991b1b', label: 'Dirty' };
                    default: return { bg: '#fffbeb', color: '#92400e', label: 'In Progress' };
                  }
                };
                const sPill = getStatusPill(room.status);
                const cPill = getCleanPill(room.cleaningStatus);

                return (
                  <tr key={room._id}>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#09090b' }}>
                      Room {room.roomNumber}
                    </td>
                    <td style={{ color: '#52525b' }}>Floor {room.floor}</td>
                    <td style={{ fontWeight: 500, color: '#09090b' }}>{room.roomType?.name || 'Standard'}</td>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#09090b' }}>
                      ${room.roomType?.basePrice || 150}
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: sPill.bg, color: sPill.color, border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span className="status-dot" style={{ background: sPill.dot }} />
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.74rem', fontWeight: 500, padding: '3px 8px', borderRadius: '4px', background: cPill.bg, color: cPill.color }}>
                        {cPill.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleDeleteRoom(room._id)}
                        style={{ padding: '4px 8px', color: '#991b1b', borderColor: '#fecaca' }}
                        title="Delete Room"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
