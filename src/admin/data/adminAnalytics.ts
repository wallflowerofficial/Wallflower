// Admin analytics computations
import { getAllAdminOrders } from './adminOrders';
import { getAllAdminProducts } from './adminProducts';
import { getStoredUsers } from '../../data/auth';
import type { SalesDataPoint, AnalyticsPeriod } from '../types/admin';

function formatLabel(date: Date, period: AnalyticsPeriod): string {
  if (period === 'day') {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  if (period === 'week') {
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  }
  if (period === 'month') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function getStartDate(period: AnalyticsPeriod): Date {
  const now = new Date();
  if (period === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

export function getSalesData(period: AnalyticsPeriod): SalesDataPoint[] {
  const orders = getAllAdminOrders().filter((o) => o.adminStatus !== 'cancelled');
  const products = getAllAdminProducts();
  const start = getStartDate(period);
  const now = new Date();

  // Build cost map: product id → average cost
  const costMap = new Map(
    products.map((p) => [p.id, (p.costPrices.A3 + p.costPrices.A4 + p.costPrices.A5) / 3])
  );

  // Filter orders within range
  const inRange = orders.filter((o) => new Date(o.date) >= start && new Date(o.date) <= now);

  // Build bucket labels
  const buckets: Map<string, { revenue: number; profit: number; orders: number }> = new Map();

  if (period === 'day') {
    for (let h = 0; h < 24; h++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate(), h);
      const label = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      buckets.set(label, { revenue: 0, profit: 0, orders: 0 });
    }
  } else if (period === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      buckets.set(label, { revenue: 0, profit: 0, orders: 0 });
    }
  } else if (period === 'month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      buckets.set(label, { revenue: 0, profit: 0, orders: 0 });
    }
  } else {
    for (let m = 0; m < 12; m++) {
      const date = new Date(now.getFullYear(), m, 1);
      const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      buckets.set(label, { revenue: 0, profit: 0, orders: 0 });
    }
  }

  for (const order of inRange) {
    const orderDate = new Date(order.date);
    const label = formatLabel(orderDate, period);
    const bucket = buckets.get(label);
    if (!bucket) continue;

    const revenue = order.amountPaid || order.total;
    const cost = order.items.reduce((s, item) => {
      const avgCost = costMap.get(item.posterId) || 50;
      return s + avgCost * item.quantity;
    }, 0);
    const profit = revenue - cost;

    bucket.revenue += revenue;
    bucket.profit += profit;
    bucket.orders += 1;
  }

  return Array.from(buckets.entries()).map(([label, data]) => ({ label, ...data }));
}

export function getDashboardStats() {
  const orders = getAllAdminOrders();
  const users = getStoredUsers();
  const products = getAllAdminProducts();
  const today = new Date().toDateString();

  const todayOrders = orders.filter((o) => new Date(o.date).toDateString() === today);
  const completed = orders.filter((o) => o.adminStatus === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + (o.amountPaid || o.total), 0);

  // Simple profit: revenue - 50% (avg cost ratio)
  const totalProfit = completed.reduce((s, o) => {
    const rev = o.amountPaid || o.total;
    return s + rev * 0.5;
  }, 0);

  return {
    liveVisitors: Math.floor(Math.random() * 15) + 2, // simulated
    totalAccounts: users.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.adminStatus === 'pending').length,
    completedOrders: completed.length,
    cancelledOrders: orders.filter((o) => o.adminStatus === 'cancelled').length,
    totalRevenue,
    totalProfit,
    averageOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
    todaySales: todayOrders.reduce((s, o) => s + (o.amountPaid || o.total), 0),
    todayOrders: todayOrders.length,
    recentOrders: orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    salesData: getSalesData('week'),
    totalProducts: products.filter((p) => !p.archived).length,
  };
}

export function getBestSellingProducts() {
  const orders = getAllAdminOrders().filter((o) => o.adminStatus !== 'cancelled');
  const countMap = new Map<string, { name: string; revenue: number; qty: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = countMap.get(item.posterId) || { name: item.name, revenue: 0, qty: 0 };
      existing.revenue += item.price * item.quantity;
      existing.qty += item.quantity;
      countMap.set(item.posterId, existing);
    }
  }

  return Array.from(countMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);
}

export function getPopularSizes() {
  const orders = getAllAdminOrders().filter((o) => o.adminStatus !== 'cancelled');
  const counts = { A3: 0, A4: 0, A5: 0 };

  for (const order of orders) {
    for (const item of order.items) {
      if (item.size === 'A3') counts.A3 += item.quantity;
      else if (item.size === 'A4') counts.A4 += item.quantity;
      else if (item.size === 'A5') counts.A5 += item.quantity;
    }
  }

  return counts;
}
