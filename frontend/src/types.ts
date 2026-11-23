export type PosterSize = 'A3' | 'A4' | 'A5';

export interface PosterPrices {
  A3: number;
  A4: number;
  A5: number;
}

export interface PosterDimensions {
  cm: string;
  inches: string;
}

export interface Poster {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  editorialNote?: string;
  prices: PosterPrices;
  image: string;
  aspectRatio?: string;
  category?: string;
  palette?: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  id: string; // `${posterId}-${size}`
  posterId: string;
  name: string;
  image: string;
  size: PosterSize;
  price: number;
  quantity: number;
}

export interface UserAddress {
  id: string;
  name: string; // Name of the address (*)
  addressLine1: string; // Shipping address line 1 (*)
  addressLine2?: string; // Shipping address line 2 (optional)
  pincode: string; // Pin/Zipcode (*)
  cityName: string; // City Name (*)
  state: string; // State (*)
  isDefault?: boolean;
  createdAt?: string;
}

export interface UserNotificationPreferences {
  orderUpdates: boolean;
  shippingNotifications: boolean;
  promotionalEmails: boolean;
  offers: boolean;
  smsTracking?: boolean;
  qualityAlerts?: boolean;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  addresses?: UserAddress[];
  avatar?: string; // Data URL for profile photo
  password?: string;
  createdAt: string;
  isTestAccount?: boolean;
  notifications?: UserNotificationPreferences;
  activeSessions?: UserSession[];
}

export type OrderTrackingStatus = 'Confirmed' | 'Printing' | 'Dispatched' | 'Delivered';

export interface OrderItem {
  posterId: string;
  name: string;
  image: string;
  size: PosterSize;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderTrackingStatus;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: {
    fullName: string;
    address: string;
    email: string;
    phone?: string;
  };
}

export type SettingsTab = 'profile' | 'address' | 'security' | 'notifications' | 'privacy';

export type ViewState = 
  | { view: 'home' }
  | { view: 'catalog'; category?: string }
  | { view: 'product'; posterId: string }
  | { view: 'collection'; type: 'custom' | 'curated' }
  | { view: 'cart' }
  | { view: 'orders' }
  | { view: 'settings'; tab?: SettingsTab };
