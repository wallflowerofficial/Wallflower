import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, ChevronDown, User as UserIcon, Package, Sliders, LogOut, Plus, Flower2 } from 'lucide-react';
import { ViewState, User } from '../types';
import flowerLogo from '../assets/flower-logo.png';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenOrders,
  onOpenSettings,
  onLogout
}) => {
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const collectionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (collectionRef.current && !collectionRef.current.contains(target)) {
        setCollectionDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };

    if (collectionDropdownOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [collectionDropdownOpen, profileDropdownOpen]);

  // Handle ESC key to close dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCollectionDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCollection = (type: 'custom' | 'curated') => {
    setCollectionDropdownOpen(false);
    onNavigate({ view: 'collection', type });
  };

  const handleProfileButtonClick = () => {
    if (currentUser) {
      setProfileDropdownOpen((prev) => !prev);
    } else {
      onOpenAuth();
    }
  };

  const isHomeActive = currentView.view === 'home';
  const isCatalogActive = currentView.view === 'catalog' || currentView.view === 'product';
  const isCollectionActive = currentView.view === 'collection';

  return (
    <header className="wf-navbar" role="banner">
      <div className="wf-container wf-navbar-inner">
        {/* ==============================================================
            LEFT SIDE: BRAND LOGO + HOME + CATALOG + COLLECTION
            ============================================================== */}
        <div className="wf-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Brand Logo: Flower Image */}
          <button
            className="wf-brand-logo"
            onClick={() => onNavigate({ view: 'home' })}
            aria-label="Wallflower homepage"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <img
              src={flowerLogo}
              alt="Wallflower"
              style={{
                height: '38px',
                width: '38px',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                display: 'block'
              }}
            />
          </button>

          {/* Navigation Links on the Left */}
          <nav className="wf-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px' }} aria-label="Main Navigation">
            {/* 1. Home */}
            <button
              className={`wf-nav-link ${isHomeActive ? 'active' : ''}`}
              onClick={() => onNavigate({ view: 'home' })}
            >
              Home
            </button>

            {/* 2. Catalog */}
            <button
              className={`wf-nav-link ${isCatalogActive ? 'active' : ''}`}
              onClick={() => onNavigate({ view: 'catalog' })}
            >
              Catalog
            </button>

            {/* 3. Collection Dropdown */}
            <div className="wf-nav-dropdown-wrapper" ref={collectionRef}>
              <button
                className={`wf-nav-dropdown-toggle ${collectionDropdownOpen ? 'open' : ''} ${isCollectionActive ? 'active' : ''}`}
                onClick={() => setCollectionDropdownOpen((prev) => !prev)}
                aria-expanded={collectionDropdownOpen}
                aria-haspopup="true"
              >
                <span>Collection</span>
                <ChevronDown size={15} strokeWidth={2} />
              </button>

              {collectionDropdownOpen && (
                <div
                  className="wf-dropdown-menu"
                  style={{
                    left: 0,
                    right: 'auto',
                    padding: 0,
                    overflow: 'hidden',
                    width: '320px'
                  }}
                  role="menu"
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
                    {/* Left: Create Your Own Collection */}
                    <button
                      className="wf-dropdown-item"
                      role="menuitem"
                      onClick={() => handleSelectCollection('custom')}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '28px 16px',
                        textAlign: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: 0
                      }}
                    >
                      <Plus size={28} strokeWidth={1.8} color="#171717" />
                      <span style={{
                        fontSize: '0.78rem',
                        color: '#555555',
                        fontWeight: 500,
                        lineHeight: 1.3
                      }}>
                        Create Your Own Collection
                      </span>
                    </button>

                    {/* Vertical Divider */}
                    <div style={{
                      width: '1px',
                      backgroundColor: '#EBEBEB',
                      margin: '20px 0'
                    }} />

                    {/* Right: Collections by Wallflower */}
                    <button
                      className="wf-dropdown-item"
                      role="menuitem"
                      onClick={() => handleSelectCollection('curated')}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '28px 16px',
                        textAlign: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: 0
                      }}
                    >
                      <Flower2 size={28} strokeWidth={1.4} color="#171717" />
                      <span style={{
                        fontSize: '0.78rem',
                        color: '#555555',
                        fontWeight: 500,
                        lineHeight: 1.3
                      }}>
                        Collections by Wallflower
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* ==============================================================
            RIGHT SIDE: PROFILE DROPDOWN (ORDERS, SETTINGS) + CART
            ============================================================== */}
        <div className="wf-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Profile Dropdown Container */}
          <div className="wf-nav-dropdown-wrapper" ref={profileRef} style={{ position: 'relative' }}>
            <button
              className="wf-cart-button"
              onClick={handleProfileButtonClick}
              aria-label={currentUser ? `Account menu for ${currentUser.firstName}` : 'Sign in or Log in'}
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
              style={{
                position: 'relative'
              }}
            >
              {currentUser ? (
                currentUser.avatar ? (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1px solid #EAEAEA'
                    }}
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.firstName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#171717',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                  </div>
                )
              ) : (
                <UserIcon size={20} strokeWidth={1.8} />
              )}
            </button>

            {/* Profile Dropdown Menu with Orders & Settings */}
            {currentUser && profileDropdownOpen && (
              <div
                className="wf-dropdown-menu"
                style={{
                  right: 0,
                  left: 'auto',
                  width: '240px',
                  padding: '8px'
                }}
                role="menu"
              >
                {/* User Identity Preview */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #EAEAEA',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {currentUser.avatar ? (
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={currentUser.avatar}
                          alt="Avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: '#171717',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#171717',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.74rem',
                          color: '#888888',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option 1: Orders (Shows orders made & tracking) */}
                <button
                  className="wf-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenOrders();
                  }}
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}
                >
                  <Package size={16} color="#171717" />
                  <div>
                    <span className="wf-dropdown-item-title" style={{ margin: 0 }}>Orders</span>
                  </div>
                </button>

                {/* Option 2: Settings (Edit personal details, address & profile picture) */}
                <button
                  className="wf-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenSettings();
                  }}
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}
                >
                  <Sliders size={16} color="#171717" />
                  <div>
                    <span className="wf-dropdown-item-title" style={{ margin: 0 }}>Settings</span>
                  </div>
                </button>

                <div className="wf-dropdown-divider" />

                {/* Log Out */}
                <button
                  className="wf-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#DC2626'
                  }}
                >
                  <LogOut size={16} color="#DC2626" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button
            className={`wf-cart-button ${currentView.view === 'cart' ? 'active' : ''}`}
            onClick={onOpenCart}
            aria-label={`Cart with ${cartCount} items`}
            title="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="wf-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
