import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Guest from '../models/Guest.js';
import { AuditLog } from '../models/HousekeepingLog.js';
import { mockData } from '../mockDb.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hms_super_secret_jwt_key_2026_safe', {
    expiresIn: '7d'
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;
    try {
      user = await User.findOne({ email });
    } catch (err) {
      console.log('Mongoose buffering fallback to mock data...');
    }

    if (user && (await user.comparePassword(password))) {
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated. Please contact your administrator.' });
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        token: generateToken(user._id)
      });
    }

    // Check mockData dynamic registry for persistent staff login fallback
    const mockUser = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || u.plainPassword === password));
    if (mockUser) {
      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        permissions: mockUser.permissions,
        token: generateToken(mockUser._id)
      });
    }

    // Demo Accounts Quick Fallback
    if (email === 'admin@hms.com' && password === 'admin123') {
      return res.json({
        _id: 'usr_admin_1',
        name: 'System Admin',
        email: 'admin@hms.com',
        role: 'Admin',
        permissions: [],
        token: generateToken('usr_admin_1')
      });
    }

    if (email === 'manager@hms.com' && password === 'manager123') {
      return res.json({
        _id: 'usr_manager_1',
        name: 'Sarah Jenkins (Manager)',
        email: 'manager@hms.com',
        role: 'Manager',
        permissions: [
          { module: 'bookings', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'rooms', actions: ['view', 'create', 'edit'] },
          { module: 'guests', actions: ['view', 'create', 'edit'] },
          { module: 'billing', actions: ['view', 'create', 'edit'] },
          { module: 'housekeeping', actions: ['view', 'edit'] },
          { module: 'reports', actions: ['view'] },
          { module: 'staff', actions: ['view', 'create', 'edit'] }
        ],
        token: generateToken('usr_manager_1')
      });
    }

    if (email === 'receptionist@hms.com' && (password === 'reception123' || password === 'staff123')) {
      return res.json({
        _id: 'usr_reception_1',
        name: 'Michael Scott (Reception)',
        email: 'receptionist@hms.com',
        role: 'Receptionist',
        permissions: [
          { module: 'bookings', actions: ['view', 'create', 'edit'] },
          { module: 'guests', actions: ['view', 'create', 'edit'] },
          { module: 'billing', actions: ['view', 'create'] },
          { module: 'rooms', actions: ['view'] }
        ],
        token: generateToken('usr_reception_1')
      });
    }

    if (email === 'guest@example.com' && password === 'guest123') {
      return res.json({
        _id: 'usr_guest_1',
        name: 'Alexander Wright',
        email: 'guest@example.com',
        role: 'Guest',
        permissions: [],
        token: generateToken('usr_guest_1')
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const registerGuest = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Guest',
      permissions: []
    });

    const guest = await Guest.create({
      user: user._id,
      name,
      email,
      phone: phone || 'N/A'
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      guestId: guest._id,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password, role, shift, permissions } = req.body;
    const creator = req.user;

    // Role Hierarchy Validation
    if (creator.role === 'Manager' && (role === 'Admin' || role === 'Manager')) {
      return res.status(403).json({ message: 'Managers can only create Employee accounts (Receptionist, Housekeeping).' });
    }

    // Privilege Escalation Prevention for Managers
    if (creator.role === 'Manager') {
      for (const reqPerm of permissions || []) {
        const creatorPerm = creator.permissions.find(p => p.module === reqPerm.module);
        if (!creatorPerm) {
          return res.status(403).json({
            message: `Privilege escalation blocked: You do not possess permission for module '${reqPerm.module}'.`
          });
        }
        for (const action of reqPerm.actions || []) {
          if (!creatorPerm.actions.includes(action)) {
            return res.status(403).json({
              message: `Privilege escalation blocked: You do not have '${action}' permission for module '${reqPerm.module}'.`
            });
          }
        }
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const newStaff = await User.create({
      name,
      email,
      password,
      role,
      shift: shift || 'Morning',
      created_by: creator._id,
      permissions: permissions || []
    });

    // Sync to in-memory fallback store for permanent persistence across restarts
    mockData.users.push({
      _id: newStaff._id.toString(),
      name: newStaff.name,
      email: newStaff.email,
      password,
      plainPassword: password,
      role: newStaff.role,
      shift: newStaff.shift,
      permissions: newStaff.permissions
    });

    // Create Audit Trail Record
    await AuditLog.create({
      action: 'CREATE_STAFF_ACCOUNT',
      performedBy: creator._id,
      targetUser: newStaff._id,
      details: `Created staff account '${newStaff.email}' with role '${role}'.`
    });

    return res.status(201).json({
      _id: newStaff._id,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      shift: newStaff.shift,
      permissions: newStaff.permissions
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStaffList = async (req, res) => {
  try {
    let query = { role: { $ne: 'Guest' } };
    
    // If Manager, list staff created by this manager or employee accounts
    if (req.user.role === 'Manager') {
      query = { 
        $or: [
          { created_by: req.user._id },
          { role: { $in: ['Receptionist', 'Housekeeping'] } }
        ]
      };
    }

    const staff = await User.find(query).populate('created_by', 'name email role').select('-password');
    return res.json(staff);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStaffPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, shift, permissions, isActive, password } = req.body;
    const creator = req.user;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Staff user not found' });
    }

    if (creator.role === 'Manager') {
      if (targetUser.role === 'Admin' || targetUser.role === 'Manager') {
        return res.status(403).json({ message: 'Managers cannot modify Admin or Manager accounts.' });
      }
      // Check privilege escalation
      for (const reqPerm of permissions || []) {
        const creatorPerm = creator.permissions.find(p => p.module === reqPerm.module);
        if (!creatorPerm) {
          return res.status(403).json({
            message: `Privilege escalation blocked: You lack permission for module '${reqPerm.module}'.`
          });
        }
        for (const action of reqPerm.actions || []) {
          if (!creatorPerm.actions.includes(action)) {
            return res.status(403).json({
              message: `Privilege escalation blocked: You lack '${action}' action for module '${reqPerm.module}'.`
            });
          }
        }
      }
    }

    if (name !== undefined) targetUser.name = name;
    if (role !== undefined && creator.role === 'Admin') targetUser.role = role;
    if (shift !== undefined) targetUser.shift = shift;
    if (permissions !== undefined) targetUser.permissions = permissions;
    if (isActive !== undefined) targetUser.isActive = isActive;
    if (password) targetUser.password = password;

    await targetUser.save();

    // Sync updates to mockData registry
    const mockIdx = mockData.users.findIndex(u => u.email.toLowerCase() === targetUser.email.toLowerCase());
    if (mockIdx !== -1) {
      if (name !== undefined) mockData.users[mockIdx].name = name;
      if (role !== undefined) mockData.users[mockIdx].role = role;
      if (shift !== undefined) mockData.users[mockIdx].shift = shift;
      if (permissions !== undefined) mockData.users[mockIdx].permissions = permissions;
      if (password) {
        mockData.users[mockIdx].password = password;
        mockData.users[mockIdx].plainPassword = password;
      }
    }

    await AuditLog.create({
      action: 'UPDATE_STAFF_ACCOUNT',
      performedBy: creator._id,
      targetUser: targetUser._id,
      details: `Updated staff user '${targetUser.email}'.`
    });

    return res.json({
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      permissions: targetUser.permissions,
      isActive: targetUser.isActive
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStaffAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = req.user;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Staff user not found' });
    }

    if (targetUser.role === 'Admin') {
      return res.status(403).json({ message: 'System Admin accounts cannot be deleted.' });
    }

    if (creator.role === 'Manager' && (targetUser.role === 'Manager' || targetUser.role === 'Admin')) {
      return res.status(403).json({ message: 'Managers cannot delete Admin or Manager accounts.' });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.create({
      action: 'DELETE_STAFF_ACCOUNT',
      performedBy: creator._id,
      details: `Deleted staff account '${targetUser.email}'.`
    });

    return res.json({ message: 'Staff account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    let user = req.user;
    if (user && user._id && mongoose.Types.ObjectId.isValid(user._id)) {
      const dbUser = await User.findById(req.user._id).select('-password');
      if (dbUser) user = dbUser;
    }
    let guestProfile = null;
    if (user && user.role === 'Guest' && user._id && mongoose.Types.ObjectId.isValid(user._id)) {
      guestProfile = await Guest.findOne({ user: user._id });
    }
    return res.json({ user, guestProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
