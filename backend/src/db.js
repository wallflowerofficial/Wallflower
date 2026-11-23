import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const SEED_DATA = {
  adminUsers: [
    {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@wallflower.art',
      password: 'wallflower@admin123',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginHistory: [],
      twoFactorEnabled: false
    }
  ],
  adminSessions: [],
  activityLogs: [],
  customers: [
    {
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
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ],
  products: [
    {
      id: 'car-porsche-911',
      name: 'Porsche 911 Turbo S',
      subtitle: 'German Engineering',
      description: 'A timeless icon of speed and precision. The 911 Turbo S captured in dramatic lighting against a moody backdrop.',
      prices: { A3: 117, A4: 105, A5: 99 },
      costPrices: { A3: 60, A4: 50, A5: 40 },
      enabledSizes: { A3: true, A4: true, A5: true },
      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80&auto=format&fit=crop'],
      category: 'Sports',
      inStock: true,
      featured: true,
      isNewArrival: false,
      archived: false,
      hasOrders: true,
      collectionIds: [],
      seoTitle: 'Porsche 911 Turbo S Poster',
      seoDescription: 'High quality A3, A4, A5 Porsche 911 Turbo S art prints.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'car-lamborghini-huracan',
      name: 'Lamborghini Huracán',
      subtitle: 'Italian Supercar',
      description: 'Raw power meets Italian artistry. The Huracán in a striking pose that commands attention on any wall.',
      prices: { A3: 117, A4: 105, A5: 99 },
      costPrices: { A3: 60, A4: 50, A5: 40 },
      enabledSizes: { A3: true, A4: true, A5: true },
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop'],
      category: 'Supercar',
      inStock: true,
      featured: true,
      isNewArrival: false,
      archived: false,
      hasOrders: false,
      collectionIds: [],
      seoTitle: 'Lamborghini Huracán Poster',
      seoDescription: 'High quality supercar art poster.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'car-bmw-m4',
      name: 'BMW M4 Competition',
      subtitle: 'The Ultimate Driving Machine',
      description: 'Aggressive stance, refined aesthetics. The M4 Competition showcased in its natural element.',
      prices: { A3: 117, A4: 105, A5: 99 },
      costPrices: { A3: 60, A4: 50, A5: 40 },
      enabledSizes: { A3: true, A4: true, A5: true },
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80&auto=format&fit=crop'],
      category: 'Sports',
      inStock: true,
      featured: false,
      isNewArrival: true,
      archived: false,
      hasOrders: false,
      collectionIds: [],
      seoTitle: 'BMW M4 Competition Poster',
      seoDescription: 'Modern BMW M4 high-definition wall print.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'car-mercedes-amg-gt',
      name: 'Mercedes-AMG GT',
      subtitle: 'Handcrafted by Racers',
      description: 'The long hood and muscular proportions of the AMG GT make it one of the most photogenic cars ever built.',
      prices: { A3: 117, A4: 105, A5: 99 },
      costPrices: { A3: 60, A4: 50, A5: 40 },
      enabledSizes: { A3: true, A4: true, A5: true },
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop'],
      category: 'Grand Tourer',
      inStock: true,
      featured: true,
      isNewArrival: false,
      archived: false,
      hasOrders: false,
      collectionIds: [],
      seoTitle: 'Mercedes-AMG GT Poster',
      seoDescription: 'Handcrafted Mercedes AMG print in A3, A4, A5.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'car-ferrari-f40',
      name: 'Ferrari F40',
      subtitle: 'The Last Enzo Ferrari',
      description: 'The purest expression of a road-going race car. The F40 is automotive art in its most visceral form.',
      prices: { A3: 117, A4: 105, A5: 99 },
      costPrices: { A3: 60, A4: 50, A5: 40 },
      enabledSizes: { A3: true, A4: true, A5: true },
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop'],
      category: 'Classic',
      inStock: true,
      featured: true,
      isNewArrival: false,
      archived: false,
      hasOrders: false,
      collectionIds: [],
      seoTitle: 'Ferrari F40 Classic Art Poster',
      seoDescription: 'Vintage legendary Ferrari F40 wall poster.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  orders: [
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
      amountPaid: 204,
      paymentStatus: 'paid',
      adminStatus: 'completed',
      confirmedAt: '2026-11-20T10:30:00.000Z',
      confirmedBy: 'admin_001',
      qikinkOrderId: 'QK-94821',
      shippingPartner: 'BlueDart Express',
      trackingId: 'WF-BLR-948210492IN',
      shippingStatus: 'Dispatched',
      shippingAddress: {
        fullName: 'Demo Collector',
        address: '42 Indiranagar, 100ft Road, Bengaluru, Karnataka 560038',
        email: 'demo@wallflower.art',
        phone: '+91 98765 43210'
      },
      shippingDetails: {
        fullName: 'Demo Collector',
        email: 'demo@wallflower.art',
        phone: '+91 98765 43210',
        houseNumber: '42',
        street: '100ft Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India'
      }
    },
    {
      id: 'WF-839201',
      userId: 'usr_test_default',
      date: 'November 23, 2026',
      items: [
        {
          posterId: 'car-lamborghini-huracan',
          name: 'Lamborghini Huracán',
          image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop',
          size: 'A3',
          price: 117,
          quantity: 2
        }
      ],
      subtotal: 234,
      shipping: 99,
      total: 333,
      amountPaid: 333,
      paymentStatus: 'paid',
      adminStatus: 'pending',
      shippingAddress: {
        fullName: 'Aarav Sharma',
        address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru 560066',
        email: 'aarav@gmail.com',
        phone: '+91 99887 76655'
      },
      shippingDetails: {
        fullName: 'Aarav Sharma',
        email: 'aarav@gmail.com',
        phone: '+91 99887 76655',
        houseNumber: 'Villa 12',
        street: 'Palm Meadows, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        country: 'India'
      }
    }
  ],
  collections: [
    {
      id: 'col_supercars',
      name: 'Supercars Edition',
      description: 'The fastest, most breathtaking machines in automotive history.',
      coverImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop',
      posterIds: ['car-porsche-911', 'car-lamborghini-huracan', 'car-ferrari-f40'],
      enabled: true,
      featured: true,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  discounts: [
    {
      id: 'disc_welcome10',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      scope: 'global',
      minOrderValue: 200,
      usedCount: 14,
      revenueGenerated: 2890,
      isActive: true,
      canCombine: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  reviews: [
    {
      id: 'rev_1',
      posterId: 'car-porsche-911',
      posterName: 'Porsche 911 Turbo S',
      userId: 'usr_test_default',
      customerName: 'Demo Collector',
      rating: 5,
      comment: 'The print quality and paper thickness exceeded my expectations. Looks stunning in my studio!',
      status: 'approved',
      createdAt: new Date().toISOString()
    }
  ]
};

// Database class
class JSONDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.writeAll(SEED_DATA);
    }
  }

  readAll() {
    try {
      if (!fs.existsSync(DB_FILE)) return { ...SEED_DATA };
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database file:', err);
      return { ...SEED_DATA };
    }
  }

  writeAll(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  get(table) {
    const data = this.readAll();
    return data[table] || [];
  }

  set(table, items) {
    const data = this.readAll();
    data[table] = items;
    this.writeAll(data);
  }

  insert(table, item) {
    const data = this.readAll();
    if (!data[table]) data[table] = [];
    data[table].push(item);
    this.writeAll(data);
    return item;
  }

  update(table, id, updates) {
    const data = this.readAll();
    if (!data[table]) return null;
    const idx = data[table].findIndex((item) => item.id === id);
    if (idx === -1) return null;
    data[table][idx] = { ...data[table][idx], ...updates, updatedAt: new Date().toISOString() };
    this.writeAll(data);
    return data[table][idx];
  }

  delete(table, id) {
    const data = this.readAll();
    if (!data[table]) return false;
    const initialLen = data[table].length;
    data[table] = data[table].filter((item) => item.id !== id);
    this.writeAll(data);
    return data[table].length < initialLen;
  }

  logAction({ adminId, action, targetId, targetType, description }) {
    const entry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: adminId || 'admin',
      action,
      targetId: targetId || null,
      targetType: targetType || null,
      description,
      timestamp: new Date().toISOString()
    };
    const data = this.readAll();
    if (!data.activityLogs) data.activityLogs = [];
    data.activityLogs.unshift(entry);
    if (data.activityLogs.length > 500) {
      data.activityLogs = data.activityLogs.slice(0, 500);
    }
    this.writeAll(data);
    return entry;
  }
}

export const db = new JSONDatabase();
