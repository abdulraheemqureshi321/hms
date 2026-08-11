import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hms_super_secret_jwt_key_2026_safe');
      
      try {
        if (mongoose.Types.ObjectId.isValid(decoded.id)) {
          req.user = await User.findById(decoded.id).select('-password');
        }
      } catch (dbErr) {
        req.user = null;
      }

      if (!req.user) {
        let email = 'admin@hms.com';
        let role = 'Admin';
        let name = 'System Admin';

        if (decoded.id === 'usr_manager_1') { role = 'Manager'; name = 'Sarah Jenkins (Manager)'; email = 'manager@hms.com'; }
        else if (decoded.id === 'usr_reception_1') { role = 'Receptionist'; name = 'Michael Scott (Reception)'; email = 'receptionist@hms.com'; }
        else if (decoded.id === 'usr_guest_1') { role = 'Guest'; name = 'Alexander Wright'; email = 'alex@example.com'; }

        // Attempt DB lookup by email
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
          req.user = userByEmail;
        } else {
          const cleanHex = String(decoded.id).replace(/[^a-fA-F0-9]/g, '').padEnd(24, '0').slice(0, 24);
          req.user = {
            _id: new mongoose.Types.ObjectId(cleanHex),
            name,
            email,
            role,
            isActive: true,
            permissions: role === 'Manager' ? [
              { module: 'bookings', actions: ['view', 'create', 'edit', 'delete'] },
              { module: 'rooms', actions: ['view', 'create', 'edit'] },
              { module: 'guests', actions: ['view', 'create', 'edit'] },
              { module: 'billing', actions: ['view', 'create', 'edit'] },
              { module: 'housekeeping', actions: ['view', 'edit'] },
              { module: 'reports', actions: ['view'] },
              { module: 'staff', actions: ['view', 'create', 'edit'] }
            ] : role === 'Receptionist' ? [
              { module: 'bookings', actions: ['view', 'create', 'edit'] },
              { module: 'guests', actions: ['view', 'create', 'edit'] },
              { module: 'billing', actions: ['view', 'create'] },
              { module: 'rooms', actions: ['view'] }
            ] : []
          };
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hms_super_secret_jwt_key_2026_safe');
      
      try {
        if (mongoose.Types.ObjectId.isValid(decoded.id)) {
          req.user = await User.findById(decoded.id).select('-password');
        }
      } catch (dbErr) {
        req.user = null;
      }

      if (!req.user) {
        let email = 'admin@hms.com';
        let role = 'Admin';
        let name = 'System Admin';

        if (decoded.id === 'usr_manager_1') { role = 'Manager'; name = 'Sarah Jenkins (Manager)'; email = 'manager@hms.com'; }
        else if (decoded.id === 'usr_reception_1') { role = 'Receptionist'; name = 'Michael Scott (Reception)'; email = 'receptionist@hms.com'; }
        else if (decoded.id === 'usr_guest_1') { role = 'Guest'; name = 'Alexander Wright'; email = 'alex@example.com'; }

        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
          req.user = userByEmail;
        } else {
          const cleanHex = String(decoded.id).replace(/[^a-fA-F0-9]/g, '').padEnd(24, '0').slice(0, 24);
          req.user = {
            _id: new mongoose.Types.ObjectId(cleanHex),
            name,
            email,
            role,
            isActive: true
          };
        }
      }
    } catch (error) {
      req.user = null;
    }
  }
  return next();
};

export const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Admin has full access to all modules and actions
    if (req.user.role === 'Admin') {
      return next();
    }

    // Guests have inherent access to public portal routes & personal booking routes
    if (req.user.role === 'Guest' && moduleName === 'guest_portal') {
      return next();
    }

    // Check module permission in user's permissions array
    const modPermission = req.user.permissions.find(p => p.module === moduleName);
    if (modPermission && modPermission.actions.includes(action)) {
      return next();
    }

    return res.status(403).json({
      message: `Access denied. Requires '${action}' permission for module '${moduleName}'.`
    });
  };
};
