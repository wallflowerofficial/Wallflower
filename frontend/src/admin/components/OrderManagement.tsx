import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Search, SortAsc, SortDesc,
  CheckCircle2, Package, AlertCircle, Calendar, X
} from 'lucide-react';
import {
  getPendingOrders, getCompletedOrders, confirmOrder,
  searchOrders, sortOrders, filterOrdersByDate
} from '../data/adminOrders';
import type { AdminOrder } from '../types/admin';
import { getPosterPlaceholderSvg } from '../../utils/posterArt';

// ─── Confirm Order Modal ──────────────────────────────────────────────────────

interface ConfirmModalProps {
  order: AdminOrder;
  onConfirm: (qikinkId: string) => void;
  onCancel: () => void;
}

const ConfirmOrderModal: React.FC<ConfirmModalProps> = ({ order, onConfirm, onCancel }) => {
  const [qikinkId, setQikinkId] = useState('');

  return (
    <div className="adm-modal-backdrop" onClick={onCancel}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: 48, height: 48, background: '#F0FDF4', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <CheckCircle2 size={24} color="#22C55E" />
        </div>
        <h3 className="adm-modal-title">Confirm Order {order.id}?</h3>
        <p className="adm-modal-desc">
          Please confirm that you have <strong>successfully placed this order on Qikink</strong>.
          Once confirmed, the order will move to Completed Orders and cannot be undone.
        </p>

        <div className="adm-form-group">
          <label className="adm-form-label">Qikink Order ID (optional)</label>
          <input
            className="adm-form-input"
            type="text"
            value={qikinkId}
            onChange={(e) => setQikinkId(e.target.value)}
            placeholder="e.g. QK-123456"
          />
        </div>

        <div className="adm-alert adm-alert-info" style={{ marginBottom: 20 }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>This action marks the order as submitted to Qikink. It does NOT mean the customer has received their poster.</span>
        </div>

        <div className="adm-modal-actions">
          <button className="adm-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="adm-btn-green" onClick={() => onConfirm(qikinkId)}>
            <CheckCircle2 size={15} />
            Yes, Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Expanded Order Detail ────────────────────────────────────────────────────

interface OrderDetailProps {
  order: AdminOrder;
  onConfirm?: () => void;
  mode: 'pending' | 'completed';
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onConfirm, mode }) => {
  const sd = order.shippingDetails;
  const totalPosters = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="adm-order-expand-body">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Customer Info */}
        <div className="adm-order-section">
          <div className="adm-order-section-title">Customer Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Full Name" value={order.shippingAddress?.fullName || sd?.fullName || '—'} />
            <InfoRow label="Email" value={order.shippingAddress?.email || sd?.email || '—'} />
            <InfoRow label="Phone" value={order.shippingAddress?.phone || sd?.phone || order.phone || '—'} />
          </div>
        </div>

        {/* Shipping Info */}
        <div className="adm-order-section">
          <div className="adm-order-section-title">Shipping Address</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sd ? (
              <>
                {sd.houseNumber && <InfoRow label="House / Building" value={sd.houseNumber} />}
                <InfoRow label="Street / Area" value={sd.street} />
                <InfoRow label="City" value={sd.city || '—'} />
                <InfoRow label="State" value={sd.state || '—'} />
                <InfoRow label="PIN Code" value={sd.pincode || '—'} />
                <InfoRow label="Country" value={sd.country || 'India'} />
              </>
            ) : (
              <InfoRow label="Address" value={order.shippingAddress?.address || '—'} />
            )}
          </div>
        </div>
      </div>

      {/* Ordered Products */}
      <div className="adm-order-section">
        <div className="adm-order-section-title">Ordered Products</div>
        {order.items.map((item, idx) => (
          <div key={idx} className="adm-order-product-row">
            <img
              className="adm-order-product-img"
              src={item.image}
              alt={item.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getPosterPlaceholderSvg(item.name);
              }}
            />
            <div style={{ flex: 1 }}>
              <div className="adm-order-product-name">{item.name}</div>
              <div className="adm-order-product-id">ID: {item.posterId}</div>
              <div className="adm-order-product-meta">
                Size: {item.size} &nbsp;•&nbsp; Qty: {item.quantity}
              </div>
            </div>
            <div className="adm-order-product-price">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 400 }}>
                ₹{item.price} each
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="adm-order-section">
          <div className="adm-order-section-title">Payment &amp; Order Summary</div>
          <div>
            <InfoRow label="Order ID" value={order.id} mono />
            <InfoRow label="Order Date" value={order.date} />
            <InfoRow label="Total Posters" value={String(totalPosters)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="adm-payment-row"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
            <div className="adm-payment-row"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : '₹' + order.shipping}</span></div>
            <div className="adm-payment-row total"><span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span></div>
            <div className="adm-payment-row"><span>Amount Paid</span><span style={{ color: '#22C55E', fontWeight: 700 }}>₹{(order.amountPaid || order.total)?.toLocaleString('en-IN')}</span></div>
            <div className="adm-payment-row">
              <span>Payment Status</span>
              <span className={`adm-badge adm-badge-${order.paymentStatus === 'paid' ? 'completed' : 'pending'}`}>
                {order.paymentStatus || 'paid'}
              </span>
            </div>
          </div>
        </div>

        {/* Qikink / Shipping (Completed mode) */}
        {mode === 'completed' && (
          <div className="adm-order-section">
            <div className="adm-order-section-title">Fulfilment Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <InfoRow label="Confirmed At" value={order.confirmedAt ? new Date(order.confirmedAt).toLocaleString('en-IN') : '—'} />
              <InfoRow label="Qikink Order ID" value={order.qikinkOrderId || '—'} mono />
              <InfoRow label="Shipping Partner" value={order.shippingPartner || '—'} />
              <InfoRow label="Tracking ID" value={order.trackingId || '—'} mono />
              <InfoRow label="Shipping Status" value={order.shippingStatus || '—'} />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Button (Pending mode only) */}
      {mode === 'pending' && onConfirm && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
          <div className="adm-alert adm-alert-warning" style={{ marginBottom: 12 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>Place this order on <strong>Qikink</strong> first, then click "Confirm Order" below.</span>
          </div>
          <button className="adm-btn-green" onClick={onConfirm}>
            <CheckCircle2 size={15} />
            Confirm Order — Mark as Submitted to Qikink
          </button>
        </div>
      )}
    </div>
  );
};

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.84rem' }}>
      <span style={{ color: '#6B7280' }}>{label}:</span>
      <span style={{ fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', color: '#111318' }}>{value}</span>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: AdminOrder;
  mode: 'pending' | 'completed';
  onConfirmRequest: (order: AdminOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, mode, onConfirmRequest }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="adm-order-card">
      <div className="adm-order-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="adm-order-card-info">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="adm-order-name">{order.shippingAddress?.fullName || 'Customer'}</span>
              <span className={`adm-badge adm-badge-${order.adminStatus}`}>{order.adminStatus}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
              <span className="adm-order-id">{order.id}</span>
              <span className="adm-order-date">{order.date}</span>
              {mode === 'completed' && order.confirmedAt && (
                <span className="adm-order-date">
                  Confirmed: {new Date(order.confirmedAt).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            ₹{(order.amountPaid || order.total)?.toLocaleString('en-IN')}
          </span>
          {expanded ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
        </div>
      </div>

      {expanded && (
        <OrderDetail
          order={order}
          mode={mode}
          onConfirm={mode === 'pending' ? () => onConfirmRequest(order) : undefined}
        />
      )}
    </div>
  );
};

// ─── Order Management (Main) ──────────────────────────────────────────────────

export const OrderManagement: React.FC = () => {
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<AdminOrder[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<AdminOrder | null>(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortDir, setSortDir] = useState<'newest' | 'oldest'>('newest');
  const [toast, setToast] = useState<string | null>(null);

  const loadOrders = () => {
    setPendingOrders(getPendingOrders());
    setCompletedOrders(getCompletedOrders());
  };

  useEffect(() => { loadOrders(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirm = (qikinkId: string) => {
    if (!confirmTarget) return;
    const result = confirmOrder(confirmTarget.id, qikinkId);
    if (result.success) {
      showToast(`Order ${confirmTarget.id} confirmed and moved to Completed!`);
      setConfirmTarget(null);
      loadOrders();
      setTab('completed');
    } else {
      showToast(result.error || 'Error confirming order.');
      setConfirmTarget(null);
    }
  };

  const displayOrders = tab === 'pending' ? pendingOrders : completedOrders;
  const dateFiltered = filterOrdersByDate(
    displayOrders,
    dateFrom ? new Date(dateFrom) : null,
    dateTo ? new Date(dateTo) : null
  );
  const filtered = sortOrders(searchOrders(search, dateFiltered), sortDir);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-section-title">Order Management</h1>
        <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
          Manage, confirm, and track customer orders through Qikink.
        </p>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        <button
          className={`adm-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          <Package size={14} />
          Pending Orders
          {pendingOrders.length > 0 && (
            <span style={{
              background: '#EF4444', color: '#fff', borderRadius: 10,
              fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px'
            }}>{pendingOrders.length}</span>
          )}
        </button>
        <button
          className={`adm-tab ${tab === 'completed' ? 'active' : ''}`}
          onClick={() => setTab('completed')}
        >
          <CheckCircle2 size={14} />
          Completed Orders
          {completedOrders.length > 0 && (
            <span style={{ color: '#22C55E', fontSize: '0.8rem', fontWeight: 700 }}>
              {completedOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input
            className="adm-search-input"
            type="text"
            placeholder="Search by Order ID or customer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} color="#6B7280" />
          <input
            type="date"
            className="adm-form-input"
            style={{ width: 'auto', padding: '7px 10px', fontSize: '0.82rem' }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="From date"
          />
          <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>to</span>
          <input
            type="date"
            className="adm-form-input"
            style={{ width: 'auto', padding: '7px 10px', fontSize: '0.82rem' }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="To date"
          />
          {(dateFrom || dateTo) && (
            <button
              className="adm-btn-icon"
              title="Clear date filter"
              onClick={() => { setDateFrom(''); setDateTo(''); }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className="adm-btn-secondary"
          onClick={() => setSortDir((d) => (d === 'newest' ? 'oldest' : 'newest'))}
        >
          {sortDir === 'newest' ? <SortDesc size={14} /> : <SortAsc size={14} />}
          {sortDir === 'newest' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="adm-empty-state">
          <Package size={40} />
          <div className="adm-empty-title">
            {search || dateFrom || dateTo ? 'No orders match your filter' : `No ${tab} orders`}
          </div>
          <div className="adm-empty-desc">
            {tab === 'pending'
              ? 'All orders have been processed.'
              : 'Confirmed orders will appear here.'}
          </div>
        </div>
      ) : (
        <div>
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              mode={tab}
              onConfirmRequest={setConfirmTarget}
            />
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmTarget && (
        <ConfirmOrderModal
          order={confirmTarget}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="adm-toast">
          <CheckCircle2 size={16} color="#22C55E" />
          {toast}
        </div>
      )}
    </div>
  );
};
