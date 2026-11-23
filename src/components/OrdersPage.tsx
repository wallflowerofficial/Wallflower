import React, { useState } from 'react';
import { Home, Package, Truck, CheckCircle2, Clock, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Order, OrderTrackingStatus } from '../types';
import { getPosterPlaceholderSvg } from '../utils/posterArt';

interface OrdersPageProps {
  orders: Order[];
  onBackToCatalog: () => void;
  onExplorePrints: () => void;
}

const STATUS_STEPS: { status: OrderTrackingStatus; label: string; desc: string }[] = [
  { status: 'Confirmed', label: 'Order Confirmed', desc: 'Verified & payment processed' },
  { status: 'Printing', label: 'Giclée Printing', desc: 'Archival pigment on 230gsm matte paper' },
  { status: 'Dispatched', label: 'Dispatched', desc: 'Packed in reinforced cardboard tube' },
  { status: 'Delivered', label: 'Delivered', desc: 'Safely arrived at destination' }
];

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onBackToCatalog,
  onExplorePrints
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  const getStepIndex = (status: OrderTrackingStatus): number => {
    switch (status) {
      case 'Confirmed': return 0;
      case 'Printing': return 1;
      case 'Dispatched': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  return (
    <div className="wf-orders-page" style={{ padding: '36px 0 80px', minHeight: '80vh' }}>
      <div className="wf-container">
        {/* Page Title & Subtitle */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid #EAEAEA', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888' }}>
              Account &amp; History
            </span>
            <button
              onClick={onBackToCatalog}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#171717',
                backgroundColor: '#FAFAFA',
                border: '1px solid #EAEAEA',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0F0';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.borderColor = '#EAEAEA';
              }}
            >
              <Home size={16} strokeWidth={1.8} />
              <span>back to home</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#171717', letterSpacing: '-0.03em' }}>
              My Orders &amp; Tracking
            </h1>
            {orders.length > 0 && (
              <span style={{ fontSize: '1rem', color: '#888888', fontWeight: 500 }}>
                ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.92rem', color: '#666666', marginTop: '6px' }}>
            Review real-time giclée print production, courier dispatches, and delivery status.
          </p>
        </div>

        {/* Orders Content */}
        {orders.length === 0 ? (
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FAFAFA',
              borderRadius: '12px',
              border: '1px solid #EAEAEA',
              maxWidth: '680px',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAEAEA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: '#888888'
              }}
            >
              <Package size={32} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#171717', marginBottom: '8px' }}>
              No orders placed yet
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#888888', maxWidth: '380px', lineHeight: 1.6, marginBottom: '28px' }}>
              Your order history and live courier tracking will appear here once you place an order.
            </p>
            <button
              className="wf-btn-add-to-cart"
              style={{ maxWidth: '220px' }}
              onClick={onExplorePrints}
            >
              Explore Prints
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => {
              const currentStepIdx = getStepIndex(order.status);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EAEAEA',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {/* Order Top Bar Header */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    style={{
                      padding: '20px 24px',
                      backgroundColor: '#FAFAFA',
                      cursor: 'pointer',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      borderBottom: isExpanded ? '1px solid #EAEAEA' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#F0F0F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#171717',
                          flexShrink: 0
                        }}
                      >
                        <Package size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#171717' }}>
                            Order #{order.id}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              backgroundColor: order.status === 'Delivered' ? '#ECFDF5' : '#EFF6FF',
                              color: order.status === 'Delivered' ? '#059669' : '#2677E8'
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#777777', marginTop: '2px', display: 'block' }}>
                          Placed on {order.date} • Total: <strong style={{ color: '#171717' }}>₹{order.total.toLocaleString('en-IN')}</strong> ({order.items.reduce((s, i) => s + i.quantity, 0)} {order.items.length === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                        {isExpanded ? 'Hide Details' : 'View Tracking & Details'}
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Order Details & Tracking */}
                  {isExpanded && (
                    <div style={{ padding: '28px 24px' }}>
                      {/* Interactive Tracking Timeline */}
                      <div style={{ marginBottom: '36px', paddingBottom: '32px', borderBottom: '1px solid #F0F0F0' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', display: 'block', marginBottom: '20px' }}>
                          Live Order Tracking
                        </span>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '16px',
                            position: 'relative'
                          }}
                        >
                          {STATUS_STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div
                                key={step.status}
                                style={{
                                  backgroundColor: isCurrent ? '#F8FAFC' : '#FFFFFF',
                                  border: isCurrent ? '1px solid #2677E8' : '1px solid #EAEAEA',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  position: 'relative',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                  <div
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '50%',
                                      backgroundColor: isCompleted ? '#171717' : '#EAEAEA',
                                      color: isCompleted ? '#FFFFFF' : '#888888',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      flexShrink: 0
                                    }}
                                  >
                                    {isCompleted ? <CheckCircle2 size={15} /> : idx + 1}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.84rem',
                                      fontWeight: isCurrent ? 700 : 600,
                                      color: isCompleted ? '#171717' : '#888888'
                                    }}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.76rem', color: '#777777', margin: 0, lineHeight: 1.4 }}>
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Courier & Delivery Info */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '20px',
                          marginBottom: '32px',
                          backgroundColor: '#FAFAFA',
                          borderRadius: '8px',
                          padding: '20px',
                          border: '1px solid #EAEAEA'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#171717', marginBottom: '8px' }}>
                            <Truck size={17} />
                            <strong style={{ fontSize: '0.88rem' }}>Carrier &amp; Courier</strong>
                          </div>
                          <span style={{ fontSize: '0.84rem', color: '#555555', display: 'block' }}>
                            {order.carrier}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#888888', display: 'block', marginTop: '4px' }}>
                            Tracking #: <strong>{order.trackingNumber}</strong>
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#171717', marginBottom: '8px' }}>
                            <Clock size={17} />
                            <strong style={{ fontSize: '0.88rem' }}>Estimated Delivery</strong>
                          </div>
                          <span style={{ fontSize: '0.84rem', color: '#555555', display: 'block' }}>
                            {order.estimatedDelivery}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#059669', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                            On schedule
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#171717', marginBottom: '8px' }}>
                            <MapPin size={17} />
                            <strong style={{ fontSize: '0.88rem' }}>Delivery Address</strong>
                          </div>
                          <span style={{ fontSize: '0.84rem', color: '#555555', display: 'block' }}>
                            {order.shippingAddress.fullName}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#888888', display: 'block', marginTop: '2px', lineHeight: 1.4 }}>
                            {order.shippingAddress.address}
                          </span>
                        </div>
                      </div>

                      {/* Items Purchased List */}
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', display: 'block', marginBottom: '16px' }}>
                          Ordered Prints ({order.items.length})
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                          {order.items.map((item, idx) => (
                            <div
                              key={`${order.id}-${item.posterId}-${idx}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px',
                                padding: '12px 16px',
                                border: '1px solid #EAEAEA',
                                borderRadius: '8px',
                                backgroundColor: '#FFFFFF'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div
                                  style={{
                                    width: '48px',
                                    height: '64px',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: '1px solid #EAEAEA',
                                    flexShrink: 0,
                                    backgroundColor: '#FAFAFA'
                                  }}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = getPosterPlaceholderSvg(item.name);
                                    }}
                                  />
                                </div>
                                <div>
                                  <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#171717' }}>
                                    {item.name}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', color: '#888888' }}>
                                    Size: {item.size} • Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>

                              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#171717' }}>
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Cost Breakdown */}
                        <div
                          style={{
                            maxWidth: '320px',
                            marginLeft: 'auto',
                            backgroundColor: '#FAFAFA',
                            border: '1px solid #EAEAEA',
                            borderRadius: '8px',
                            padding: '16px',
                            fontSize: '0.84rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666666' }}>
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666666' }}>
                            <span>Shipping</span>
                            <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              paddingTop: '10px',
                              borderTop: '1px solid #EAEAEA',
                              fontWeight: 700,
                              fontSize: '0.98rem',
                              color: '#171717'
                            }}
                          >
                            <span>Total Paid</span>
                            <span>₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
