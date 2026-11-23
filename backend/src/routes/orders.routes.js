import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/orders (filters: status, search, from, to, sort)
router.get('/', (req, res) => {
  const { status, search, from, to, sort } = req.query;
  let orders = db.get('orders');

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.adminStatus === status);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingDetails?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.email?.toLowerCase().includes(q)
    );
  }

  if (from) {
    const fromDate = new Date(from);
    orders = orders.filter((o) => new Date(o.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    orders = orders.filter((o) => new Date(o.date) <= toDate);
  }

  orders.sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return sort === 'oldest' ? diff : -diff;
  });

  res.json({ success: true, orders, total: orders.length });
});

// GET /api/orders/pending
router.get('/pending', (req, res) => {
  const orders = db.get('orders')
    .filter((o) => o.adminStatus === 'pending')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ success: true, orders, total: orders.length });
});

// GET /api/orders/completed
router.get('/completed', (req, res) => {
  const orders = db.get('orders')
    .filter((o) => o.adminStatus === 'completed')
    .sort((a, b) => new Date(b.confirmedAt || b.date).getTime() - new Date(a.confirmedAt || a.date).getTime());
  res.json({ success: true, orders, total: orders.length });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db.get('orders').find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, order });
});

// POST /api/orders (Customer creates a new order)
router.post('/', (req, res) => {
  const orderData = req.body;
  const orderId = orderData.id || `WF-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder = {
    ...orderData,
    id: orderId,
    adminStatus: 'pending',
    paymentStatus: orderData.paymentStatus || 'paid',
    amountPaid: orderData.amountPaid || orderData.total,
    date: orderData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  db.insert('orders', newOrder);

  // Mark all ordered products as having orders
  if (Array.isArray(newOrder.items)) {
    for (const item of newOrder.items) {
      if (item.posterId) {
        db.update('products', item.posterId, { hasOrders: true });
      }
    }
  }

  res.status(201).json({ success: true, order: newOrder });
});

// PATCH /api/orders/:id/confirm (Administrator manual confirmation after submitting to Qikink)
router.patch('/:id/confirm', (req, res) => {
  const { id } = req.params;
  const { qikinkOrderId, adminId } = req.body;

  const orders = db.get('orders');
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.adminStatus === 'completed') {
    return res.status(400).json({ error: 'Order has already been confirmed' });
  }

  const updated = db.update('orders', id, {
    adminStatus: 'completed',
    confirmedAt: new Date().toISOString(),
    confirmedBy: adminId || 'admin',
    qikinkOrderId: qikinkOrderId || order.qikinkOrderId || null
  });

  db.logAction({
    adminId: adminId || 'admin',
    action: 'order_confirmed',
    targetId: id,
    targetType: 'order',
    description: `Order ${id} confirmed and submitted to Qikink${qikinkOrderId ? ` (Qikink ID: ${qikinkOrderId})` : ''}.`
  });

  res.json({ success: true, order: updated });
});

// PATCH /api/orders/:id/shipping (Update shipping partner, tracking ID, status)
router.patch('/:id/shipping', (req, res) => {
  const { id } = req.params;
  const { shippingPartner, trackingId, shippingStatus, qikinkOrderId } = req.body;

  const order = db.get('orders').find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const updated = db.update('orders', id, {
    ...(shippingPartner !== undefined && { shippingPartner }),
    ...(trackingId !== undefined && { trackingId }),
    ...(shippingStatus !== undefined && { shippingStatus }),
    ...(qikinkOrderId !== undefined && { qikinkOrderId })
  });

  res.json({ success: true, order: updated });
});

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason, adminId } = req.body;

  const order = db.get('orders').find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const updated = db.update('orders', id, {
    adminStatus: 'cancelled',
    cancellationReason: reason || 'Cancelled by administrator',
    cancelledAt: new Date().toISOString()
  });

  db.logAction({
    adminId: adminId || 'admin',
    action: 'order_cancelled',
    targetId: id,
    targetType: 'order',
    description: `Order ${id} cancelled: ${reason || 'No reason provided'}.`
  });

  res.json({ success: true, order: updated });
});

export default router;
