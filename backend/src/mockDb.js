// High-Performance In-Memory Data Store Fallback
export const mockData = {
  users: [
    {
      _id: '65f000000000000000000001',
      name: 'System Admin',
      email: 'admin@hms.com',
      password: 'admin123',
      role: 'Admin',
      permissions: []
    },
    {
      _id: '65f000000000000000000002',
      name: 'Sarah Jenkins (Manager)',
      email: 'manager@hms.com',
      password: 'manager123',
      role: 'Manager',
      permissions: [
        { module: 'bookings', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'rooms', actions: ['view', 'create', 'edit'] },
        { module: 'guests', actions: ['view', 'create', 'edit'] },
        { module: 'billing', actions: ['view', 'create', 'edit'] },
        { module: 'housekeeping', actions: ['view', 'edit'] },
        { module: 'reports', actions: ['view'] },
        { module: 'staff', actions: ['view', 'create', 'edit'] }
      ]
    },
    {
      _id: '65f000000000000000000003',
      name: 'Michael Scott (Reception)',
      email: 'receptionist@hms.com',
      password: 'staff123',
      role: 'Receptionist',
      permissions: [
        { module: 'bookings', actions: ['view', 'create', 'edit'] },
        { module: 'guests', actions: ['view', 'create', 'edit'] },
        { module: 'billing', actions: ['view', 'create'] },
        { module: 'rooms', actions: ['view'] }
      ]
    },
    {
      _id: '65f000000000000000000004',
      name: 'Alexander Wright',
      email: 'alex@example.com',
      password: 'guest123',
      role: 'Guest',
      permissions: []
    }
  ],

  roomTypes: [
    {
      _id: '65a000000000000000000001',
      name: 'Boutique Deluxe Single',
      basePrice: 140,
      capacity: 1,
      description: 'Cozy modern boutique room with queen bed, high-speed Wi-Fi, ambient warm lighting, and city view.',
      amenities: ['High-Speed Wi-Fi', 'Climate Control AC', '4K Smart TV', 'Espresso Bar', 'Work Desk'],
      photos: ['/boutique_single.png']
    },
    {
      _id: '65a000000000000000000002',
      name: 'Executive King Deluxe',
      basePrice: 220,
      capacity: 2,
      description: 'Spacious double suite featuring king size bed, custom marble bathroom, executive desk, and rainfall shower.',
      amenities: ['High-Speed Wi-Fi', 'Climate Control AC', '55" OLED TV', 'Mini Bar & Cellar', 'In-room Safe', 'Marble Bathtub'],
      photos: ['/executive_deluxe.png']
    },
    {
      _id: '65a000000000000000000003',
      name: 'Presidential Ocean Suite',
      basePrice: 450,
      capacity: 4,
      description: 'Opulent suite with private ocean view balcony, living lounge, master king bed, jacuzzi, and 24/7 room service.',
      amenities: ['High-Speed Wi-Fi', 'Climate Control AC', '65" OLED TV', 'Private Bar', 'Panoramic Balcony', 'Jacuzzi', '24/7 Butler Service'],
      photos: ['/luxury_suite.png']
    }
  ],

  rooms: [
    { _id: '65b000000000000000000101', roomNumber: '101', roomType: { _id: '65a000000000000000000001', name: 'Boutique Deluxe Single', basePrice: 140 }, floor: 1, status: 'Reserved', cleaningStatus: 'Clean' },
    { _id: '65b000000000000000000102', roomNumber: '102', roomType: { _id: '65a000000000000000000001', name: 'Boutique Deluxe Single', basePrice: 140 }, floor: 1, status: 'Available', cleaningStatus: 'Clean' },
    { _id: '65b000000000000000000201', roomNumber: '201', roomType: { _id: '65a000000000000000000002', name: 'Executive King Deluxe', basePrice: 220 }, floor: 2, status: 'Occupied', cleaningStatus: 'Clean' },
    { _id: '65b000000000000000000202', roomNumber: '202', roomType: { _id: '65a000000000000000000002', name: 'Executive King Deluxe', basePrice: 220 }, floor: 2, status: 'Available', cleaningStatus: 'Dirty' },
    { _id: '65b000000000000000000301', roomNumber: '301', roomType: { _id: '65a000000000000000000003', name: 'Presidential Ocean Suite', basePrice: 450 }, floor: 3, status: 'Available', cleaningStatus: 'Clean' }
  ],

  guests: [
    { _id: '65c000000000000000000001', name: 'Alexander Wright', email: 'alex@example.com', phone: '+1 555-0192', idType: 'Passport', idNumber: 'A98210392', user: '65f000000000000000000004' },
    { _id: '65c000000000000000000002', name: 'Claire Vance', email: 'claire.vance@gmail.com', phone: '+1 555-0841', idType: 'CNIC/National ID', idNumber: '35202-9182301-1' }
  ],

  bookings: [
    {
      _id: '65d000000000000000000001',
      bookingCode: 'HMS-DEMO-001',
      guest: '65c000000000000000000001',
      room: '65b000000000000000000101',
      roomType: '65a000000000000000000001',
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 259200000),
      guestsCount: 1,
      status: 'Confirmed',
      source: 'portal',
      totalAmount: 462,
      specialRequests: 'High floor preferred'
    }
  ],

  payments: [
    {
      _id: '65e000000000000000000001',
      booking: '65d000000000000000000001',
      amount: 462,
      taxAmount: 42,
      paymentMethod: 'card',
      paymentStatus: 'Paid',
      transactionId: 'TXN-SEED-9021'
    }
  ]
};
