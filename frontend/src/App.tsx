import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CatalogGrid } from './components/CatalogGrid';
import { ProductDetail } from './components/ProductDetail';
import { CartPage } from './components/CartPage';
import { CollectionsView } from './components/CollectionsView';
import { OrdersPage } from './components/OrdersPage';
import { SettingsPage } from './components/SettingsPage';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { POSTERS_DATA } from './data/posters';
import { Poster, PosterSize, CartItem, ViewState, User, Order } from './types';
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  deleteUserAccount,
  saveUser,
  getStoredOrders,
  saveOrder
} from './data/auth';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation state with URL hash synchronization
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash === 'catalog') return { view: 'catalog' };
    if (!hash || hash === 'home') return { view: 'home' };
    return { view: 'home' };
  });
  
  // User Authentication state
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() =>
    getStoredOrders(currentUser?.id)
  );

  // Refresh orders whenever currentUser changes
  useEffect(() => {
    setOrders(getStoredOrders(currentUser?.id));
  }, [currentUser]);

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('wf_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wf_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // URL hash sync for browser back/forward and shareable links
  const parseHash = useCallback((): ViewState => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash || hash === 'home') {
      return { view: 'home' };
    }
    if (hash === 'catalog') {
      return { view: 'catalog' };
    }
    if (hash === 'cart') {
      return { view: 'cart' };
    }
    if (hash.startsWith('product/')) {
      const id = hash.replace('product/', '');
      return { view: 'product', posterId: id };
    }
    if (hash === 'collection/custom') {
      return { view: 'collection', type: 'custom' };
    }
    if (hash === 'collection/curated') {
      return { view: 'collection', type: 'curated' };
    }
    if (hash === 'orders') {
      return { view: 'orders' };
    }
    if (hash === 'settings' || hash.startsWith('settings/')) {
      const parts = hash.split('/');
      const rawTab = parts[1];
      const validTabs = ['profile', 'address', 'security', 'notifications', 'privacy'];
      const tab = validTabs.includes(rawTab) ? (rawTab as any) : 'profile';
      return { view: 'settings', tab };
    }
    return { view: 'home' };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(parseHash());
    };

    // Initial load
    if (window.location.hash) {
      setCurrentView(parseHash());
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseHash]);

  const navigateTo = (newView: ViewState) => {
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (newView.view === 'home') {
      window.location.hash = '#home';
    } else if (newView.view === 'catalog') {
      window.location.hash = '#catalog';
    } else if (newView.view === 'cart') {
      window.location.hash = '#cart';
    } else if (newView.view === 'product') {
      window.location.hash = `#product/${newView.posterId}`;
    } else if (newView.view === 'collection') {
      window.location.hash = `#collection/${newView.type}`;
    } else if (newView.view === 'orders') {
      window.location.hash = '#orders';
    } else if (newView.view === 'settings') {
      window.location.hash = newView.tab ? `#settings/${newView.tab}` : '#settings/profile';
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUserState(user);
    persistCurrentUser(user);
    setOrders(getStoredOrders(user.id));
    showToast(`Welcome back, ${user.firstName}!`);
  };

  const handleUpdateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    setCurrentUserState(updatedUser);
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    persistCurrentUser(null);
    setOrders([]);
    navigateTo({ view: 'catalog' });
    showToast('Logged out successfully.');
  };

  const handleDeleteAccount = (userId: string) => {
    deleteUserAccount(userId);
    setCurrentUserState(null);
    setOrders([]);
    navigateTo({ view: 'catalog' });
    showToast('Account deleted.');
  };

  // Add to Cart handling with duplicate merge
  const handleAddToCart = (poster: Poster, size: PosterSize, quantity: number) => {
    const key = `${poster.id}-${size}`;
    const unitPrice = poster.prices[size];

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === key);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: key,
            posterId: poster.id,
            name: poster.name,
            image: poster.image,
            size,
            price: unitPrice,
            quantity
          }
        ];
      }
    });

    showToast(`Added ${poster.name} (${size}) to cart`);
  };

  // Buy Now handling
  const handleBuyNow = (poster: Poster, size: PosterSize, quantity: number) => {
    const unitPrice = poster.prices[size];
    const directItem: CartItem = {
      id: `${poster.id}-${size}`,
      posterId: poster.id,
      name: poster.name,
      image: poster.image,
      size,
      price: unitPrice,
      quantity
    };

    setCheckoutItems([directItem]);
    setIsCheckoutOpen(true);
  };

  // Cart quantity updates
  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProceedToCheckout = () => {
    setCheckoutItems(cart);
    setIsCheckoutOpen(true);
  };

  // Checkout order completion creates a trackable order in ₹
  const handleOrderComplete = (
    orderId?: string,
    shippingDetails?: { fullName: string; email: string; address: string }
  ) => {
    const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    const defaultAddr = currentUser?.addresses?.find((a) => a.isDefault) || currentUser?.addresses?.[0];
    const fallbackAddressText = defaultAddr
      ? `${defaultAddr.addressLine1}${defaultAddr.addressLine2 ? ', ' + defaultAddr.addressLine2 : ''}, ${defaultAddr.cityName}, ${defaultAddr.state} ${defaultAddr.pincode}`
      : (currentUser?.address || '42 Indiranagar, 100ft Road, Bengaluru, Karnataka 560038');

    const finalAddress = shippingDetails?.address || fallbackAddressText;
    const finalFullName = shippingDetails?.fullName || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Collector');
    const finalEmail = shippingDetails?.email || (currentUser?.email || 'collector@wallflower.art');

    const newOrder: Order = {
      id: orderId || ('WF-' + Math.floor(100000 + Math.random() * 900000)),
      userId: currentUser?.id || 'guest',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      items: checkoutItems.map((ci) => ({
        posterId: ci.posterId,
        name: ci.name,
        image: ci.image,
        size: ci.size,
        price: ci.price,
        quantity: ci.quantity
      })),
      subtotal,
      shipping,
      total,
      status: 'Printing',
      trackingNumber: 'WF-BLR-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN',
      carrier: 'BlueDart Express Carbon-Neutral',
      estimatedDelivery: '3–5 Business Days',
      shippingAddress: {
        fullName: finalFullName,
        address: finalAddress,
        email: finalEmail,
        phone: currentUser?.phone
      }
    };

    saveOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    showToast(`Order #${newOrder.id} confirmed! Track it in your Orders.`);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Render view body
  const renderContent = () => {
    // 0. Full Page Home View (Hero Image + 10 Latest Posters)
    if (currentView.view === 'home') {
      return (
        <HomePage
          posters={POSTERS_DATA}
          onSelectPoster={(id) => navigateTo({ view: 'product', posterId: id })}
          onExploreCatalog={() => navigateTo({ view: 'catalog' })}
        />
      );
    }

    // 1. Full Page Cart View (opens across the entire page)
    if (currentView.view === 'cart') {
      return (
        <CartPage
          items={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onProceedToCheckout={handleProceedToCheckout}
          onContinueShopping={() => navigateTo({ view: 'home' })}
          onSelectPoster={(id) => navigateTo({ view: 'product', posterId: id })}
        />
      );
    }

    // 2. Individual Product View
    if (currentView.view === 'product') {
      const poster = POSTERS_DATA.find((p) => p.id === currentView.posterId);

      // Clean fallback for non-existent poster ID
      if (!poster) {
        return (
          <div className="wf-container" style={{ padding: '96px 24px', textAlign: 'center' }}>
            <AlertCircle size={40} color="#888888" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#171717', marginBottom: '8px' }}>
              Poster Not Found
            </h2>
            <p style={{ color: '#888888', marginBottom: '24px', fontSize: '0.9rem' }}>
              The selected poster does not exist in the catalog.
            </p>
            <button
              className="wf-btn-add-to-cart"
              style={{ maxWidth: '200px', margin: '0 auto' }}
              onClick={() => navigateTo({ view: 'home' })}
            >
              Explore Prints
            </button>
          </div>
        );
      }

      return (
        <ProductDetail
          key={poster.id}
          poster={poster}
          onBackToCatalog={() => navigateTo({ view: 'home' })}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      );
    }

    // 3. Collections View
    if (currentView.view === 'collection') {
      return (
        <CollectionsView
          type={currentView.type}
          onBackToCatalog={() => navigateTo({ view: 'home' })}
        />
      );
    }

    // 4. Full Page Orders & Tracking View (Not a pop-up)
    if (currentView.view === 'orders') {
      return (
        <OrdersPage
          orders={orders}
          onBackToCatalog={() => navigateTo({ view: 'home' })}
          onExplorePrints={() => navigateTo({ view: 'catalog' })}
        />
      );
    }

    // 5. Full Page Settings View
    if (currentView.view === 'settings') {
      return (
        <SettingsPage
          user={currentUser}
          initialTab={currentView.tab || 'profile'}
          onUpdateUser={handleUpdateUser}
          onDeleteAccount={handleDeleteAccount}
          onBackToCatalog={() => navigateTo({ view: 'home' })}
          onShowToast={showToast}
          onLogout={handleLogout}
        />
      );
    }

    // 6. Default: Clean Catalog Grid
    return (
      <CatalogGrid
        posters={POSTERS_DATA}
        onSelectPoster={(id) => navigateTo({ view: 'product', posterId: id })}
        initialCategory={currentView.view === 'catalog' ? currentView.category : undefined}
      />
    );
  };

  return (
    <div className="wf-app">
      {/* Top Navigation Bar: Catalog & Collection on Left, Profile Dropdown & Cart on Right */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={totalCartCount}
        onOpenCart={() => navigateTo({ view: 'cart' })}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenOrders={() => navigateTo({ view: 'orders' })}
        onOpenSettings={() => navigateTo({ view: 'settings', tab: 'profile' })}
        onLogout={handleLogout}
      />

      {/* Main View Area (Full Page) */}
      <main className="wf-main">
        {renderContent()}
      </main>

      {/* Checkout Flow Entry Point Modal */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        currentUser={currentUser}
        onOrderComplete={handleOrderComplete}
      />

      {/* Auth Modal (Sign In / Log In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="wf-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Editorial Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
};
