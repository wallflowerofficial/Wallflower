// Admin authentication — localStorage-based session management
import type { AdminUser, AdminSession, AdminLoginRecord } from '../types/admin';

const ADMIN_USERS_KEY = 'wf_admin_users';
const ADMIN_SESSION_KEY = 'wf_admin_session';
const ADMIN_LOGS_KEY = 'wf_admin_logs';

// Default admin account (change password immediately in production!)
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin_001',
  username: 'admin',
  email: 'admin@wallflower.art',
  password: 'wallflower@admin123',
  createdAt: new Date().toISOString(),
  loginHistory: [],
  twoFactorEnabled: false,
};

// ── Storage helpers ────────────────────────────────────────────────────────

function getAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) {
      const initial = [DEFAULT_ADMIN];
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function saveAdminUsers(users: AdminUser[]): void {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

// ── Session management ────────────────────────────────────────────────────

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    // Check expiry (8 hours)
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}

export function adminLogin(
  usernameOrEmail: string,
  password: string
): { success: boolean; error?: string; admin?: AdminUser } {
  const users = getAdminUsers();
  const admin = users.find(
    (u) =>
      (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
      u.password === password
  );

  const logRecord: AdminLoginRecord = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ip: 'localhost',
    device: navigator.userAgent.substring(0, 60),
    success: !!admin,
  };

  if (!admin) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Create session (8-hour expiry)
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  const session: AdminSession = {
    adminId: admin.id,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

  // Update login history
  const updatedAdmin: AdminUser = {
    ...admin,
    lastLogin: new Date().toISOString(),
    loginHistory: [logRecord, ...(admin.loginHistory || [])].slice(0, 20),
  };
  saveAdminUsers(users.map((u) => (u.id === admin.id ? updatedAdmin : u)));

  return { success: true, admin: updatedAdmin };
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getAdminById(id: string): AdminUser | null {
  return getAdminUsers().find((u) => u.id === id) || null;
}

export function getCurrentAdmin(): AdminUser | null {
  const session = getAdminSession();
  if (!session) return null;
  return getAdminById(session.adminId);
}

export function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getAdminUsers();
  const admin = users.find((u) => u.id === adminId);
  if (!admin) return { success: false, error: 'Admin not found.' };
  if (admin.password !== currentPassword) {
    return { success: false, error: 'Current password is incorrect.' };
  }
  const updated = { ...admin, password: newPassword };
  saveAdminUsers(users.map((u) => (u.id === adminId ? updated : u)));
  return { success: true };
}

// ── Activity log ──────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  adminId: string;
  action: string;
  description: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
}

export function logAdminAction(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  try {
    const raw = localStorage.getItem(ADMIN_LOGS_KEY);
    const logs: ActivityEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: ActivityEntry = {
      ...entry,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    // Keep last 500 entries
    const updated = [newEntry, ...logs].slice(0, 500);
    localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getActivityLogs(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ADMIN_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
