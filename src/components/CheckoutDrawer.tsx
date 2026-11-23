import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import { CartItem, User, UserAddress } from '../types';
import { getPosterPlaceholderSvg } from '../utils/posterArt';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser?: User | null;
  onOrderComplete: (orderNumber?: string, shippingDetails?: { fullName: string; email: string; address: string }) => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderComplete
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Prefill user details when drawer opens & reset submitted state
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      if (currentUser) {
        setFullName(`${currentUser.firstName} ${currentUser.lastName}`.trim());
        setEmail(currentUser.email || '');
        const defaultAddr = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
        const addrStr = defaultAddr
          ? `${defaultAddr.addressLine1}${defaultAddr.addressLine2 ? ', ' + defaultAddr.addressLine2 : ''}, ${defaultAddr.cityName}, ${defaultAddr.state} ${defaultAddr.pincode}`
          : (currentUser.address || '');
        setAddress(addrStr);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleSelectSavedAddress = (addr: UserAddress) => {
    const formatted = `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.cityName}, ${addr.state} ${addr.pincode}`;
    setAddress(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockOrderNum = 'WF-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(mockOrderNum);
    setIsSubmitted(true);
    // Persist order immediately
    onOrderComplete(mockOrderNum, { fullName, email, address });
  };

  const handleFinish = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="wf-modal-backdrop" role="dialog" aria-modal="true">
      <div className="wf-checkout-modal">
        {/* Header */}
        <div className="wf-modal-header">
          <h3 className="wf-modal-title">
            {isSubmitted ? 'Order Received' : 'Checkout'}
          </h3>
          <button className="wf-cart-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="wf-modal-body">
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#F2F2F2',
                  color: '#171717',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#171717', marginBottom: '8px' }}>
                Thank you for your order
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#888888', marginBottom: '16px' }}>
                Order #{orderNumber} has been received. You can track this in your Orders menu.
              </p>
              <div
                style={{
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #EAEAEA',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#888888' }}>Recipient:</span>
                  <span style={{ fontWeight: 600 }}>{fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#888888' }}>Confirmation:</span>
                  <span style={{ fontWeight: 600 }}>{email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888888' }}>Total:</span>
                  <span style={{ fontWeight: 600, color: '#171717' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className="wf-btn-add-to-cart" onClick={handleFinish}>
                Continue Browsing
              </button>
            </div>
          ) : (
            <div>
              {/* Order Items Summary */}
              <div
                style={{
                  backgroundColor: '#FAFAFA',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '20px',
                  border: '1px solid #EAEAEA'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Order Summary ({items.reduce((s, i) => s + i.quantity, 0)})
                </span>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {it.image && (
                          <div style={{ width: '32px', height: '42px', backgroundColor: '#EEE', borderRadius: '2px', overflow: 'hidden' }}>
                            <img
                              src={it.image}
                              alt={it.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getPosterPlaceholderSvg(it.name);
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 600, color: '#171717' }}>{it.name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                            Size {it.size} • Qty {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600 }}>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    borderTop: '1px solid #EAEAEA',
                    marginTop: '12px',
                    paddingTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                >
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Purchase Details Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#171717' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E0E0E0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#171717' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E0E0E0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Saved addresses selector for quick selection */}
                {currentUser?.addresses && currentUser.addresses.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#171717' }}>
                      Select Delivery Address
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      {currentUser.addresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(a)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MapPin size={12} />
                          <span>{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#171717' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E0E0E0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button type="submit" className="wf-btn-add-to-cart">
                    <span>Complete Order — ₹{total.toLocaleString('en-IN')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
