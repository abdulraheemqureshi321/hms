import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
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

  // Open Room Type Create/Edit Modal
  const openTypeModal = (type = null) => {
    setErrorMsg('');
    if (type) {
      setEditingType(type);
      setTypeName(type.name || '');
      setBasePrice(type.basePrice || '150');
      setCapacity(type.capacity || '2');
      setDescription(type.description || '');
      setAmenitiesInput(type.amenities ? type.amenities.join(', ') : '');
      setUploadedPhotos(type.photos || []);
    } else {
      setEditingType(null);
      setTypeName('');
      setBasePrice('150');
      setCapacity('2');
      setDescription('');
      setAmenitiesInput('High-Speed Wi-Fi, Climate Control AC, 4K Smart TV');
      setUploadedPhotos([]);
    }
    setShowTypeModal(true);
  };

  // Image Upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/rooms/upload-image', formData);
      if (res.url) {
        setUploadedPhotos(prev => [...prev, res.url]);
      }
    } catch (err) {
      setErrorMsg('Image upload failed: ' + (err.message || 'Cloudinary error'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Room Category & Base Price
  const handleSaveRoomType = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const amenitiesArr = amenitiesInput.split(',').map(a => a.trim()).filter(Boolean);

    try {
      const typeData = {
        name: typeName,
        basePrice: parseFloat(basePrice),
        capacity: parseInt(capacity),
        description,
        amenities: amenitiesArr,
        photos: uploadedPhotos
      };

      if (editingType) {
        await api.put(`/rooms/types/${editingType._id}`, typeData);
      } else {
        await api.post('/rooms/types', typeData);
      }
      setShowTypeModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save room type');
    }
  };

  const handleDeleteRoomType = async (typeId) => {
    if (!window.confirm('Are you sure you want to delete this room category?')) return;
    try {
      await api.delete(`/rooms/types/${typeId}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete room category');
    }
  };

  const { hasPermission } = useAuth();

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
            Room & <span className="text-gradient">Inventory Control</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage room categories, edit pricing, upload room photos, and set operational status
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {hasPermission('rooms', 'create') && (
            <button className="btn btn-secondary" onClick={() => openTypeModal(null)}>
              <Plus size={16} /> Add Room Category
            </button>
          )}
          {hasPermission('rooms', 'create') && (
            <button className="btn btn-primary" onClick={() => setShowRoomModal(true)}>
              <Plus size={16} /> Add New Room
            </button>
          )}
        </div>
      </div>

      {/* Room Types Overview & Category Price Management */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BedDouble size={18} color="var(--accent-primary)" /> Room Categories & Pricing Rates
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Click 'Edit Category' to modify base price, capacity, or upload pics
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {roomTypes.map(t => (
          <div key={t._id} className="glass-panel" style={{ padding: '24px', position: 'relative', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            {t.photos && t.photos.length > 0 && (
              <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', background: '#f1f5f9' }}>
                <img src={t.photos[0]} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>{t.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> Capacity: {t.capacity} Person(s)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                  PKR {t.basePrice}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/night</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '12px 0', minHeight: '36px' }}>{t.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
              {t.amenities?.map((a, i) => (
                <span key={i} style={{ padding: '3px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '0.75rem', color: '#334155', fontWeight: '500' }}>
                  {a}
                </span>
              ))}
            </div>

            {(hasPermission('rooms', 'edit') || hasPermission('rooms', 'delete')) && (
              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                {hasPermission('rooms', 'edit') && (
                  <button className="btn btn-secondary" onClick={() => openTypeModal(t)} style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}>
                    <Edit3 size={14} /> Edit Category & Pricing
                  </button>
                )}
                {hasPermission('rooms', 'delete') && (
                  <button className="btn btn-secondary" onClick={() => handleDeleteRoomType(t._id)} style={{ padding: '6px 10px', color: '#dc2626' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rooms Directory */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a' }}>Individual Rooms Directory</h2>
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
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
              <tr key={room._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                  Room {room.roomNumber}
                </td>
                <td style={{ padding: '16px 12px', color: '#334155' }}>{room.roomType?.name || 'Standard'}</td>
                <td style={{ padding: '16px 12px', color: '#334155' }}>Floor {room.floor}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: room.status === 'Available' ? 'rgba(5, 150, 105, 0.1)' : room.status === 'Occupied' ? 'rgba(225, 29, 72, 0.1)' : room.status === 'Reserved' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                    color: room.status === 'Available' ? '#059669' : room.status === 'Occupied' ? '#e11d48' : room.status === 'Reserved' ? '#9333ea' : '#d97706'
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
                    background: room.cleaningStatus === 'Clean' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                    color: room.cleaningStatus === 'Clean' ? '#059669' : '#e11d48'
                  }}>
                    {room.cleaningStatus}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  {hasPermission('rooms', 'edit') ? (
                    <select
                      value={room.status}
                      onChange={(e) => handleStatusChange(room._id, e.target.value)}
                      style={{ padding: '6px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.8rem' }}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Read Only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Room Category & Pricing Manager */}
      {showTypeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>{editingType ? 'Edit Room Category & Pricing' : 'Add New Room Category'}</h2>
              <button onClick={() => setShowTypeModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '0.85rem', marginBottom: '14px', fontWeight: '500' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveRoomType} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Presidential Ocean Suite"
                  value={typeName}
                  onChange={e => setTypeName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Base Price (PKR / night)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Max Capacity (Guests)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe room features, view, and luxury details..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Amenities (comma separated)</label>
                <input
                  type="text"
                  placeholder="Wi-Fi, Ocean View, King Bed, Jacuzzi"
                  value={amenitiesInput}
                  onChange={e => setAmenitiesInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                />
              </div>

              {/* Upload Room Pictures */}
              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Upload Room Photos (Cloudinary)
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  {uploadedPhotos.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={url} alt={`Room Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(225,29,72,0.9)', border: 'none', borderRadius: '50%', color: '#fff', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <label style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '6px',
                    border: '1px dashed #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    fontSize: '0.7rem',
                    color: '#475569'
                  }}>
                    {uploadingImage ? <Sparkles size={16} className="spin" /> : <Upload size={16} />}
                    <span>{uploadingImage ? 'Uploading' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Room */}
      {showRoomModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '28px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#0f172a' }}>Add Room to Inventory</h2>
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Room Category</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
                >
                  {roomTypes.map(t => (
                    <option key={t._id} value={t._id}>{t.name} (PKR {t.basePrice}/night)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Floor Number</label>
                <input
                  type="number"
                  required
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', marginTop: '4px' }}
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
