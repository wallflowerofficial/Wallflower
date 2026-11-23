import React, { useState, useEffect } from 'react';
import { Search, Users, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { getStoredUsers } from '../../data/auth';
import { getAllAdminOrders } from '../data/adminOrders';
import type { User } from '../../types';
import type { AdminOrder } from '../types/admin';

interface CustomerRow {
  user: User;
  totalOrders: number;
  totalSpent: number;
  cancelledOrders: number;
  lastOrderDate: string | null;
  lifetimeValue: number;
  orders: AdminOrder[];
}

function buildCustomerRows(users: User[], orders: AdminOrder[]): CustomerRow[] {
  return users.map((user) => {
    const userOrders = orders.filter((o) => o.userId === user.id);
    const completed = userOrders.filter((o) => o.adminStatus === 'completed');
    const cancelled = userOrders.filter((o) => o.adminStatus === 'cancelled');
    const totalSpent = completed.reduce((s, o) => s + (o.amountPaid || o.total), 0);
    const sortedDates = userOrders
      .map((o) => new Date(o.date).getTime())
      .sort((a, b) => b - a);
    const lastOrderDate = sortedDates.length
      ? new Date(sortedDates[0]).toLocaleDateString('en-IN')
      : null;

    return {
      user,
      totalOrders: userOrders.length,
      totalSpent,
      cancelledOrders: cancelled.length,
      lastOrderDate,
      lifetimeValue: totalSpent,
      orders: userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  });
}

const CustomerDetail: React.FC<{ row: CustomerRow }> = ({ row }) => (
  <div style={{ padding: '16px 20px', background: '#FAFBFF', borderTop: '1px solid #E8ECF0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Contact</div>
        <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div><span style={{ color: '#6B7280' }}>Email: </span><strong>{row.user.email}</strong></div>
          <div><span style={{ color: '#6B7280' }}>Phone: </span><strong>{row.user.phone || '—'}</strong></div>
          <div><span style={{ color: '#6B7280' }}>Registered: </span><strong>{row.user.createdAt ? new Date(row.user.createdAt).toLocaleDateString('en-IN') : '—'}</strong></div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Stats</div>
        <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div><span style={{ color: '#6B7280' }}>Total Orders: </span><strong>{row.totalOrders}</strong></div>
          <div><span style={{ color: '#6B7280' }}>Total Spent: </span><strong>₹{row.totalSpent.toLocaleString('en-IN')}</strong></div>
          <div><span style={{ color: '#6B7280' }}>Cancelled: </span><strong>{row.cancelledOrders}</strong></div>
          <div><span style={{ color: '#6B7280' }}>Last Order: </span><strong>{row.lastOrderDate || '—'}</strong></div>
        </div>
      </div>
    </div>

    {/* Saved Addresses */}
    {row.user.addresses && row.user.addresses.length > 0 && (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Saved Addresses</div>
        {row.user.addresses.map((addr) => (
          <div key={addr.id} style={{
            padding: '8px 12px', background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 6, fontSize: '0.8rem', marginBottom: 4
          }}>
            <strong>{addr.name}{addr.isDefault ? ' (Default)' : ''}</strong>:{' '}
            {addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, {addr.cityName}, {addr.state} {addr.pincode}
          </div>
        ))}
      </div>
    )}

    {/* Order History */}
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>
        Order History ({row.orders.length})
      </div>
      {row.orders.length === 0 ? (
        <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>No orders placed.</div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="adm-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {row.orders.map((o) => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4F7EF8', fontSize: '0.78rem' }}>{o.id}</span></td>
                  <td>{o.date}</td>
                  <td>{o.items.reduce((s, i) => s + i.quantity, 0)} poster(s)</td>
                  <td style={{ fontWeight: 700 }}>₹{(o.amountPaid || o.total).toLocaleString('en-IN')}</td>
                  <td><span className={`adm-badge adm-badge-${o.adminStatus}`}>{o.adminStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export const CustomerManagement: React.FC = () => {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const users = getStoredUsers();
    const orders = getAllAdminOrders();
    setRows(buildCustomerRows(users, orders));
  }, []);

  const filtered = rows.filter((r) =>
    r.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    r.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    r.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.user.phone || '').includes(search)
  );

  const handleExport = () => {
    const csv = [
      ['Account ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Cancelled', 'Last Order'],
      ...filtered.map((r) => [
        r.user.id, r.user.firstName, r.user.lastName,
        r.user.email, r.user.phone || '',
        r.totalOrders, r.totalSpent, r.cancelledOrders, r.lastOrderDate || ''
      ])
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallflower-customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="adm-section-title">Customers</h1>
          <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
            {rows.length} registered customers.
          </p>
        </div>
        <button className="adm-btn-secondary" onClick={handleExport}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="adm-filter-bar">
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input className="adm-search-input" type="text"
            placeholder="Search by name, email or phone…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty-state">
          <Users size={40} />
          <div className="adm-empty-title">No customers found</div>
        </div>
      ) : (
        <div className="adm-card">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Account ID</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <React.Fragment key={row.user.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 700 }}>{row.user.firstName} {row.user.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{row.user.email}</div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6B7280' }}>{row.user.id}</span></td>
                      <td><span style={{ fontWeight: 600 }}>{row.totalOrders}</span></td>
                      <td><span style={{ fontWeight: 700 }}>₹{row.totalSpent.toLocaleString('en-IN')}</span></td>
                      <td style={{ color: '#6B7280', fontSize: '0.84rem' }}>{row.lastOrderDate || '—'}</td>
                      <td>
                        <button className="adm-btn-icon"
                          onClick={() => setExpandedId(expandedId === row.user.id ? null : row.user.id)}>
                          {expandedId === row.user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === row.user.id && (
                      <tr>
                        <td colSpan={6} style={{ padding: 0 }}>
                          <CustomerDetail row={row} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
