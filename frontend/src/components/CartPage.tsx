import React from 'react';
import { Home, ShoppingBag, ArrowRight, Trash2, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { CartItem } from '../types';
import { getPosterPlaceholderSvg } from '../utils/posterArt';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectPoster: (posterId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
  onSelectPoster
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="wf-cart-fullpage" style={{ padding: '36px 0 80px', minHeight: '75vh' }}>
      <div className="wf-container">
        {/* Page Title: "Cart" with Back to Home button on the right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', borderBottom: '1px solid #EAEAEA', paddingBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#171717', letterSpacing: '-0.03em' }}>
              Cart
            </h1>
            {totalItemCount > 0 && (
              <span style={{ fontSize: '1rem', color: '#888888', fontWeight: 500 }}>
                ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <button
            onClick={onContinueShopping}
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

        {/* Empty Cart State */}
        {items.length === 0 ? (
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
                width: '64px',
                height: '64px',
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
              <ShoppingBag size={28} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#171717', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Your cart is empty
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#888888', maxWidth: '360px', lineHeight: 1.6, marginBottom: '28px' }}>
              Discover our collection of art prints and find the perfect piece for your wall.
            </p>
            <button
              className="wf-btn-add-to-cart"
              style={{ maxWidth: '220px' }}
              onClick={onContinueShopping}
            >
              Explore Prints
            </button>
          </div>
        ) : (
          /* Full Page Two-Column Cart Layout across the whole screen */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '48px',
              alignItems: 'flex-start'
            }}
            className="wf-cart-page-grid"
          >
            {/* Left Column: Cart Items List (Full Width of column) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #EAEAEA',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#888888'
                }}
              >
                <span>Product</span>
                <span>Subtotal</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: '24px',
                      padding: '28px 0',
                      borderBottom: '1px solid #EAEAEA',
                      alignItems: 'center'
                    }}
                  >
                    {/* Poster Image */}
                    <div
                      style={{
                        width: '100px',
                        aspectRatio: '3 / 4',
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #EAEAEA',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectPoster(item.posterId)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getPosterPlaceholderSvg(item.name);
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          color: '#171717',
                          marginBottom: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => onSelectPoster(item.posterId)}
                      >
                        {item.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <span className="wf-cart-item-size-badge" style={{ margin: 0 }}>
                          Size {item.size}
                        </span>
                        <span style={{ fontSize: '0.84rem', color: '#888888' }}>
                          ₹{item.price.toLocaleString('en-IN')} each
                        </span>
                      </div>

                      {/* Quantity Controller & Remove Link */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="wf-cart-item-qty" style={{ border: '1px solid #D4D4D4' }}>
                          <button
                            type="button"
                            className={`wf-cart-qty-btn ${item.quantity <= 1 ? 'disabled' : ''}`}
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            style={{ width: '32px', height: '32px' }}
                          >
                            −
                          </button>
                          <span className="wf-cart-qty-val" style={{ minWidth: '32px', fontSize: '0.9rem' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="wf-cart-qty-btn"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                            style={{ width: '32px', height: '32px' }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            fontSize: '0.8rem',
                            color: '#888888',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Line Total in ₹ */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#171717' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary Box */}
            <div
              style={{
                backgroundColor: '#FAFAFA',
                border: '1px solid #EAEAEA',
                borderRadius: '12px',
                padding: '32px 28px',
                position: 'sticky',
                top: '96px'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#171717', marginBottom: '20px', letterSpacing: '-0.02em' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555555' }}>
                  <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
                  <span style={{ fontWeight: 600, color: '#171717' }}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555555' }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 600, color: shipping === 0 ? '#10B981' : '#171717' }}>
                    {shipping === 0 ? 'Free Standard Delivery' : '₹99'}
                  </span>
                </div>

                {subtotal < 999 && (
                  <div style={{ fontSize: '0.76rem', color: '#888888', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EAEAEA' }}>
                    Add ₹{(999 - subtotal).toLocaleString('en-IN')} more to unlock <strong>Free Delivery</strong> across India!
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid #EAEAEA',
                    paddingTop: '16px',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#171717'
                  }}
                >
                  <span>Total Due</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#888888' }}>
                  Taxes included where applicable
                </span>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                className="wf-btn-add-to-cart"
                onClick={onProceedToCheckout}
                style={{ width: '100%', minHeight: '52px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              {/* Reassurance perks */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #EAEAEA', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#666666' }}>
                  <Truck size={14} color="#171717" />
                  <span>Free shipping on all orders over ₹999</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#666666' }}>
                  <ShieldCheck size={14} color="#171717" />
                  <span>Museum-grade archival 230gsm matte cotton stock</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#666666' }}>
                  <RefreshCw size={14} color="#171717" />
                  <span>Secure checkout &amp; transit protection guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
