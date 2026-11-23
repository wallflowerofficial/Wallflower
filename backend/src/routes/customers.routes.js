import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/customers
router.get('/', (req, res) => {
  const { search } = req.query;
  const customers = db.get('customers');
  const orders = db.get('orders');

  let enriched = customers.map((c) => {
    const userOrders = orders.filter((o) => o.userId === c.id);
    const completedOrders = userOrders.filter((o) => o.adminStatus === 'completed');
    const cancelledOrders = userOrders.filter((o) => o.adminStatus === 'cancelled');
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.amountPaid || o.total), 0);

    const sortedDates = userOrders
      .map((o) => new Date(o.date).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a);

    return {
      ...c,
      totalOrders: userOrders.length,
      totalSpent,
      cancelledOrders: cancelledOrders.length,
      lastOrderDate: sortedDates.length ? new Date(sortedDates[0]).toLocaleDateString('en-IN') : null,
      lifetimeValue: totalSpent,
      orders: userOrders
    };
  });

  if (search) {
    const q = String(search).toLowerCase();
    enriched = enriched.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }

  res.json({ success: true, customers: enriched, total: enriched.length });
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const customer = db.get('customers').find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const orders = db.get('orders').filter((o) => o.userId === customer.id);
  res.json({ success: true, customer: { ...customer, orders } });
});

// PATCH /api/customers/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const customer = db.get('customers').find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const updated = db.update('customers', req.params.id, { status });
  res.json({ success: true, customer: updated });
});

export default router;
