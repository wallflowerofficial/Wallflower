// Admin-specific types extending the main Wallflower types
import type { Order, User, Poster } from '../../types';

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string; // hashed in production, plain for localStorage dev
  createdAt: string;
  lastLogin?: string;
  loginHistory?: AdminLoginRecord[];
  twoFactorEnabled?: boolean;
}

export interface AdminLoginRecord {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  success: boolean;
}

export interface AdminSession {
  adminId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// ─── Extended Order (Admin layer) ────────────────────────────────────────────

export type AdminOrderStatus = 'pending' | 'completed' | 'cancelled';

export interface AdminOrder extends Order {
  adminStatus: AdminOrderStatus;
  confirmedAt?: string;         // ISO timestamp when admin confirmed
  confirmedBy?: string;         // Admin ID
  qikinkOrderId?: string;       // Qikink's order reference
  shippingPartner?: string;     // e.g. "BlueDart", "DTDC"
  trackingId?: string;          // Actual courier tracking ID
  shippingStatus?: string;      // e.g. "In Transit", "Out for Delivery"
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'refunded';
  amountPaid?: number;          // Actual amount collected
  cancellationReason?: string;
  cancelledAt?: string;
  phone?: string;               // Customer phone at order time
  // Extended shipping address fields
  shippingDetails?: {
    fullName: string;
    email: string;
    phone: string;
    houseNumber?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

// ─── Extended Poster (Admin layer) ───────────────────────────────────────────

export interface AdminPoster extends Poster {
  costPrices: { A3: number; A4: number; A5: number };
  enabledSizes: { A3: boolean; A4: boolean; A5: boolean };
  images: string[];             // Multiple images; images[0] is primary
  collectionIds: string[];
  isNewArrival?: boolean;
  archived?: boolean;
  hasOrders?: boolean;          // Prevents hard delete if true
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  // Price history for preserving historical order prices
  priceHistory?: Array<{
    prices: { A3: number; A4: number; A5: number };
    changedAt: string;
  }>;
}

// ─── Collections ─────────────────────────────────────────────────────────────

export interface WallflowerCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  posterIds: string[];
  enabled: boolean;
  featured?: boolean;           // Show on homepage
  displayOrder: number;         // For rearranging
  discountId?: string;          // Collection-specific discount
  createdAt: string;
  updatedAt: string;
}

// ─── Discounts ───────────────────────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed';
export type DiscountScope = 'global' | 'collection' | 'product' | 'first_order';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;                // Percent (0-100) or fixed ₹ amount
  scope: DiscountScope;
  targetIds?: string[];         // Collection IDs or Product IDs if scoped
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;          // Max total uses
  usageLimitPerUser?: number;
  usedCount: number;
  revenueGenerated: number;     // Total revenue via this code
  isOneTimeUse?: boolean;
  isActive: boolean;
  canCombine: boolean;
  expiresAt?: string;           // ISO timestamp
  createdAt: string;
  updatedAt: string;
}

// ─── Customer (Admin-enriched) ───────────────────────────────────────────────

export interface AdminCustomer extends User {
  accountId: string;            // Same as User.id, aliased for clarity
  status: 'active' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  cancelledOrders: number;
  lastOrderDate?: string;
  lifetimeValue: number;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface ProductReview {
  id: string;
  posterId: string;
  userId: string;
  customerName: string;
  rating: number;               // 1–5
  comment: string;
  photos?: string[];
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Activity Log ────────────────────────────────────────────────────────────

export type AdminActionType =
  | 'order_confirmed'
  | 'order_cancelled'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'product_archived'
  | 'price_changed'
  | 'collection_created'
  | 'collection_updated'
  | 'discount_created'
  | 'discount_updated'
  | 'review_approved'
  | 'review_hidden'
  | 'customer_suspended'
  | 'admin_login'
  | 'admin_logout';

export interface ActivityLog {
  id: string;
  adminId: string;
  action: AdminActionType;
  targetId?: string;            // Order ID, Product ID, etc.
  targetType?: string;          // 'order', 'product', 'discount', etc.
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface SalesDataPoint {
  label: string;                // Date label for the x-axis
  revenue: number;
  profit: number;
  orders: number;
}

export interface DashboardStats {
  liveVisitors: number;
  totalAccounts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  todaySales: number;
  todayOrders: number;
  recentOrders: AdminOrder[];
  salesData: SalesDataPoint[];
}

// ─── Admin View State ────────────────────────────────────────────────────────

export type AdminView =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'collections'
  | 'customers'
  | 'analytics'
  | 'discounts'
  | 'reviews'
  | 'settings';
