import type { User, Order, UserAddress, UserNotificationPreferences, UserSession } from '../types.ts';

export const DEFAULT_ACTIVE_SESSIONS: UserSession[] = [
  {
    id: 'sess_1',
    device: 'Windows PC (Desktop)',
    browser: 'Chrome 131.0',
    location: 'Bengaluru, Karnataka, India',
    ip: '103.21.244.18',
    lastActive: 'Active now',
    isCurrent: true
  },
  {
    id: 'sess_2',
    device: 'Apple iPhone 15 Pro',
    browser: 'Mobile Safari 17.4',
    location: 'Bengaluru, Karnataka, India',
    ip: '103.21.244.22',
    lastActive: '2 hours ago',
    isCurrent: false
  },
  {
    id: 'sess_3',
    device: 'Apple MacBook Air 15"',
    browser: 'Firefox 132.0',
    location: 'Mumbai, Maharashtra, India',
    ip: '49.37.192.8',
    lastActive: '3 days ago',
    isCurrent: false
  }
];

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  orderUpdates: true,
  shippingNotifications: true,
  promotionalEmails: false,
  offers: true,
  smsTracking: true,
  qualityAlerts: true
};

// Pre-seeded fake test account that can be used for testing and deleted at any time
export const DEFAULT_TEST_USER: User = {
  id: 'usr_test_default',
  firstName: 'Demo',
  lastName: 'Collector',
  email: 'demo@wallflower.art',
  phone: '+91 98765 43210',
  address: '42 Indiranagar, 100ft Road, Bengaluru, Karnataka 560038',
  addresses: [
    {
      id: 'addr_default_1',
      name: 'Home',
      addressLine1: '42 Indiranagar, 100ft Road',
      addressLine2: 'Near Metro Station',
      pincode: '560038',
      cityName: 'Bengaluru',
      state: 'Karnataka',
      isDefault: true,
      createdAt: new Date().toISOString()
    }
  ],
  avatar: '',
  password: 'wallflower123',
  createdAt: new Date().toISOString(),
  isTestAccount: true,
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  activeSessions: DEFAULT_ACTIVE_SESSIONS
};

const USERS_STORAGE_KEY = 'wf_users';
const CURRENT_USER_STORAGE_KEY = 'wf_current_user';
const ORDERS_STORAGE_KEY = 'wf_orders';

// Initial sample order in Indian Rupee (₹) aligned with ₹105 A4 poster pricing
const DEFAULT_TEST_ORDERS: Order[] = [
  {
    id: 'WF-742918',
    userId: 'usr_test_default',
    date: 'November 20, 2026',
    items: [
      {
        posterId: 'car-porsche-911',
        name: 'Porsche 911 Turbo S',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80&auto=format&fit=crop',
        size: 'A4',
        price: 105,
        quantity: 1
      }
    ],
    subtotal: 105,
    shipping: 99,
    total: 204,
    status: 'Dispatched',
    trackingNumber: 'WF-BLR-948210492IN',
    carrier: 'BlueDart Express Carbon-Neutral',
    estimatedDelivery: 'November 24, 2026',
    shippingAddress: {
      fullName: 'Demo Collector',
      address: '42 Indiranagar, 100ft Road, Bengaluru, Karnataka 560038',
      email: 'demo@wallflower.art',
      phone: '+91 98765 43210'
    }
  }
];

function normalizeUserAddresses(user: User): User {
  if (!user.addresses || user.addresses.length === 0) {
    if (user.address && user.address.trim()) {
      const defaultAddr: UserAddress = {
        id: 'addr_init_1',
        name: 'Home',
        addressLine1: user.address,
        addressLine2: '',
        pincode: '560038',
        cityName: 'Bengaluru',
        state: 'Karnataka',
        isDefault: true,
        createdAt: new Date().toISOString()
      };
      user.addresses = [defaultAddr];
    } else {
      user.addresses = [];
    }
  }
  if (!user.notifications) {
    user.notifications = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  if (!user.activeSessions || user.activeSessions.length === 0) {
    user.activeSessions = [...DEFAULT_ACTIVE_SESSIONS];
  }
  return user;
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_TEST_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: User[] = JSON.parse(raw);
    return parsed.map(normalizeUserAddresses);
  } catch {
    return [DEFAULT_TEST_USER];
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    const user: User = JSON.parse(raw);
    return normalizeUserAddresses(user);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      const normalized = normalizeUserAddresses(user);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function saveUser(newUser: User): void {
  const normalized = normalizeUserAddresses(newUser);
  const users = getStoredUsers();
  const updated = [...users.filter((u) => u.id !== normalized.id), normalized];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  const current = getCurrentUser();
  if (current && current.id === normalized.id) {
    setCurrentUser(normalized);
  }
}

export function deleteUserAccount(userId: string): void {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(null);
  }
}

export function getStoredOrders(userId?: string): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    let orders: Order[] = raw ? JSON.parse(raw) : DEFAULT_TEST_ORDERS;
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_TEST_ORDERS));
    } else if (orders.some((o) => o.id === 'WF-742918' && o.total === 799)) {
      orders = orders.map((o) => (o.id === 'WF-742918' ? DEFAULT_TEST_ORDERS[0] : o));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
    if (userId) {
      return orders.filter((o) => o.userId === userId);
    }
    return orders;
  } catch {
    return DEFAULT_TEST_ORDERS;
  }
}

export function saveOrder(order: Order): void {
  const current = getStoredOrders();
  const updated = [order, ...current];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
}
