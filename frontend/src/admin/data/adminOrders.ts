// Admin order management — pending / completed / cancelled
import type { AdminOrder } from '../types/admin';
import { logAdminAction, getCurrentAdmin } from './adminAuth';

const ADMIN_ORDERS_KEY = 'wf_admin_orders';

// ── Helpers ────────────────────────────────────────────────────────────────

function readOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem(ADMIN_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: AdminOrder[]): void {
  localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
}

// ── Sync customer orders into the admin layer ─────────────────────────────
// Pulls from the customer-facing wf_orders and upserts into admin orders,
// keeping any admin-specific fields already set.

export function syncOrdersFromCustomerSide(): AdminOrder[] {
  try {
    const raw = localStorage.getItem('wf_orders');
    const customerOrders = raw ? JSON.parse(raw) : [];
    const adminOrders = readOrders();

    const adminMap = new Map(adminOrders.map((o) => [o.id, o]));

    for (const co of customerOrders) {
      if (!adminMap.has(co.id)) {
        // New order — add with pending status
        const adminOrder: AdminOrder = {
          ...co,
          adminStatus: 'pending',
          paymentStatus: 'paid',
          amountPaid: co.total,
          phone: co.shippingAddress?.phone || '',
          shippingDetails: {
            fullName: co.shippingAddress?.fullName || '',
            email: co.shippingAddress?.email || '',
            phone: co.shippingAddress?.phone || '',
            houseNumber: '',
            street: co.shippingAddress?.address || '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
          },
        };
        adminMap.set(co.id, adminOrder);
      }
    }

    const merged = Array.from(adminMap.values());
    writeOrders(merged);
    return merged;
  } catch {
    return readOrders();
  }
}

// ── CRUD operations ────────────────────────────────────────────────────────

export function getAllAdminOrders(): AdminOrder[] {
  return syncOrdersFromCustomerSide();
}

export function getPendingOrders(): AdminOrder[] {
  return getAllAdminOrders()
    .filter((o) => o.adminStatus === 'pending')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCompletedOrders(): AdminOrder[] {
  return getAllAdminOrders()
    .filter((o) => o.adminStatus === 'completed')
    .sort((a, b) =>
      new Date(b.confirmedAt || b.date).getTime() -
      new Date(a.confirmedAt || a.date).getTime()
    );
}

export function getCancelledOrders(): AdminOrder[] {
  return getAllAdminOrders()
    .filter((o) => o.adminStatus === 'cancelled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getOrderById(orderId: string): AdminOrder | null {
  return getAllAdminOrders().find((o) => o.id === orderId) || null;
}

/** Confirm an order (move Pending → Completed).
 *  Returns error string if already confirmed or not found. */
export function confirmOrder(
  orderId: string,
  qikinkOrderId?: string
): { success: boolean; error?: string } {
  const orders = getAllAdminOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { success: false, error: 'Order not found.' };
  if (orders[idx].adminStatus === 'completed') {
    return { success: false, error: 'Order has already been confirmed.' };
  }

  const admin = getCurrentAdmin();
  orders[idx] = {
    ...orders[idx],
    adminStatus: 'completed',
    confirmedAt: new Date().toISOString(),
    confirmedBy: admin?.id || 'admin',
    qikinkOrderId: qikinkOrderId || orders[idx].qikinkOrderId,
  };

  writeOrders(orders);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'order_confirmed',
    targetId: orderId,
    targetType: 'order',
    description: `Order ${orderId} confirmed and submitted to Qikink${qikinkOrderId ? ` (Qikink ID: ${qikinkOrderId})` : ''}.`,
  });

  return { success: true };
}

/** Update shipping details on a completed order (tracking, courier, status) */
export function updateOrderShipping(
  orderId: string,
  update: {
    shippingPartner?: string;
    trackingId?: string;
    shippingStatus?: string;
    qikinkOrderId?: string;
  }
): void {
  const orders = getAllAdminOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], ...update };
  writeOrders(orders);
}

/** Cancel an order */
export function cancelOrder(orderId: string, reason?: string): { success: boolean; error?: string } {
  const orders = getAllAdminOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { success: false, error: 'Order not found.' };
  const admin = getCurrentAdmin();

  orders[idx] = {
    ...orders[idx],
    adminStatus: 'cancelled',
    cancellationReason: reason,
    cancelledAt: new Date().toISOString(),
  };
  writeOrders(orders);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'order_cancelled',
    targetId: orderId,
    targetType: 'order',
    description: `Order ${orderId} cancelled${reason ? `: ${reason}` : ''}.`,
  });

  return { success: true };
}

// ── Search & Filter ────────────────────────────────────────────────────────

export function searchOrders(query: string, orders: AdminOrder[]): AdminOrder[] {
  const q = query.toLowerCase().trim();
  if (!q) return orders;
  return orders.filter(
    (o) =>
      o.id.toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
      o.shippingDetails?.fullName?.toLowerCase().includes(q)
  );
}

export function filterOrdersByDate(
  orders: AdminOrder[],
  from: Date | null,
  to: Date | null
): AdminOrder[] {
  return orders.filter((o) => {
    const orderDate = new Date(o.date);
    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;
    return true;
  });
}

export function sortOrders(
  orders: AdminOrder[],
  direction: 'newest' | 'oldest'
): AdminOrder[] {
  return [...orders].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return direction === 'newest' ? -diff : diff;
  });
}

// ── Analytics helpers ──────────────────────────────────────────────────────

export function getOrderStats() {
  const all = getAllAdminOrders();
  const today = new Date().toDateString();

  const todayOrders = all.filter(
    (o) => new Date(o.date).toDateString() === today
  );

  return {
    total: all.length,
    pending: all.filter((o) => o.adminStatus === 'pending').length,
    completed: all.filter((o) => o.adminStatus === 'completed').length,
    cancelled: all.filter((o) => o.adminStatus === 'cancelled').length,
    totalRevenue: all.reduce((s, o) => s + (o.amountPaid || o.total), 0),
    todaySales: todayOrders.reduce((s, o) => s + (o.amountPaid || o.total), 0),
    todayOrders: todayOrders.length,
    averageOrderValue:
      all.length > 0
        ? all.reduce((s, o) => s + (o.amountPaid || o.total), 0) / all.length
        : 0,
    recentOrders: all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
  };
}
