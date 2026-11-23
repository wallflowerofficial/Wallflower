import React, { useState, useEffect } from 'react';
import './admin.css';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar } from './components/AdminSidebar';
import { Dashboard } from './components/Dashboard';
import { OrderManagement } from './components/OrderManagement';
import { ProductManagement } from './components/ProductManagement';
import { CollectionManagement } from './components/CollectionManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { Analytics } from './components/Analytics';
import { DiscountManagement } from './components/DiscountManagement';
import { ReviewManagement } from './components/ReviewManagement';
import { AdminSettings } from './components/AdminSettings';
import {
  isAdminAuthenticated, adminLogout, getCurrentAdmin, logAdminAction
} from './data/adminAuth';
import { getPendingOrders } from './data/adminOrders';
import type { AdminUser, AdminView } from './types/admin';

const VIEW_TITLES: Record<AdminView, string> = {
  dashboard: 'Dashboard',
  orders: 'Order Management',
  products: 'Product Management',
  collections: 'Collection Management',
  customers: 'Customer Management',
  analytics: 'Analytics',
  discounts: 'Discounts & Promotions',
  reviews: 'Reviews & Feedback',
  settings: 'Admin Settings',
};

export const AdminApp: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());
  const [admin, setAdmin] = useState<AdminUser | null>(() => getCurrentAdmin());
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  // Refresh pending count whenever view changes
  useEffect(() => {
    if (authenticated) {
      setPendingCount(getPendingOrders().length);
    }
  }, [authenticated, currentView]);

  const handleLoginSuccess = (adminUser: AdminUser) => {
    setAdmin(adminUser);
    setAuthenticated(true);
    logAdminAction({
      adminId: adminUser.id,
      action: 'admin_login',
      description: `Admin "${adminUser.username}" logged in.`,
    });
  };

  const handleLogout = () => {
    if (admin) {
      logAdminAction({
        adminId: admin.id,
        action: 'admin_logout',
        description: `Admin "${admin.username}" logged out.`,
      });
    }
    adminLogout();
    setAuthenticated(false);
    setAdmin(null);
  };

  if (!authenticated || !admin) {
    return <div className="adm-root"><AdminLogin onLoginSuccess={handleLoginSuccess} /></div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={(v) => setCurrentView(v as AdminView)} />;
      case 'orders':
        return <OrderManagement />;
      case 'products':
        return <ProductManagement />;
      case 'collections':
        return <CollectionManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'analytics':
        return <Analytics />;
      case 'discounts':
        return <DiscountManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'settings':
        return <AdminSettings admin={admin} />;
      default:
        return <Dashboard onNavigate={(v) => setCurrentView(v as AdminView)} />;
    }
  };

  return (
    <div className="adm-root">
      <div className="adm-shell">
        <AdminSidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          pendingCount={pendingCount}
          onLogout={handleLogout}
          adminName={admin.username}
        />

        <div className="adm-main">
          {/* Header */}
          <div className="adm-header">
            <span className="adm-header-title">{VIEW_TITLES[currentView]}</span>
            <div className="adm-header-right">
              {pendingCount > 0 && (
                <button
                  onClick={() => setCurrentView('orders')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, color: '#B91C1C',
                    cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  <span style={{
                    width: 8, height: 8, background: '#EF4444', borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  {pendingCount} Pending Order{pendingCount !== 1 ? 's' : ''}
                </button>
              )}
              <div className="adm-admin-pill">
                <span style={{
                  width: 24, height: 24, background: '#111318', color: '#fff',
                  borderRadius: '50%', display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800
                }}>
                  {admin.username.charAt(0).toUpperCase()}
                </span>
                {admin.username}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="adm-content">
            {renderContent()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
