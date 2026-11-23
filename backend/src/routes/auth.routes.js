import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admins = db.get('adminUsers');
  const admin = admins.find(
    (a) => (a.username === username || a.email === username) && a.password === password
  );

  if (!admin) {
    db.logAction({
      adminId: 'unknown',
      action: 'admin_login_failed',
      description: `Failed login attempt for username "${username}"`
    });
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  const session = {
    adminId: admin.id,
    token,
    expiresAt,
    createdAt: new Date().toISOString()
  };

  db.insert('adminSessions', session);

  // Update admin login info
  const logRecord = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || 'localhost',
    device: req.headers['user-agent']?.substring(0, 60) || 'Browser',
    success: true
  };

  const updatedAdmin = {
    ...admin,
    lastLogin: new Date().toISOString(),
    loginHistory: [logRecord, ...(admin.loginHistory || [])].slice(0, 20)
  };
  db.update('adminUsers', admin.id, updatedAdmin);

  db.logAction({
    adminId: admin.id,
    action: 'admin_login',
    description: `Admin "${admin.username}" signed in successfully.`
  });

  const { password: _, ...safeAdmin } = updatedAdmin;
  res.json({ success: true, admin: safeAdmin, token, expiresAt });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : null;
  if (token) {
    const sessions = db.get('adminSessions').filter((s) => s.token !== token);
    db.set('adminSessions', sessions);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = db.get('adminSessions').find((s) => s.token === token);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  const admin = db.get('adminUsers').find((a) => a.id === session.adminId);
  if (!admin) {
    return res.status(401).json({ error: 'Admin account not found' });
  }

  const { password: _, ...safeAdmin } = admin;
  res.json({ success: true, admin: safeAdmin });
});

// POST /api/admin/change-password
router.post('/change-password', (req, res) => {
  const { adminId, currentPassword, newPassword } = req.body;
  if (!adminId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const admin = db.get('adminUsers').find((a) => a.id === adminId);
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  if (admin.password !== currentPassword) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  db.update('adminUsers', adminId, { password: newPassword });
  db.logAction({
    adminId,
    action: 'password_changed',
    description: `Admin "${admin.username}" changed their password.`
  });

  res.json({ success: true, message: 'Password updated successfully' });
});

// GET /api/admin/logs
router.get('/logs', (req, res) => {
  const logs = db.get('activityLogs');
  res.json({ success: true, logs });
});

export default router;
