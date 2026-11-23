import React from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart2,
  Tag, Star, Settings, LogOut, ExternalLink
} from 'lucide-react';
import type { AdminView } from '../types/admin';
import flowerLogo from '../../assets/flower-logo.png';

interface AdminSidebarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  pendingCount: number;
  onLogout: () => void;
  adminName: string;
}

const NAV_ITEMS: Array<{
  id: AdminView;
  label: string;
  icon: React.ReactNode;
  group: 'main' | 'store' | 'system';
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, group: 'main' },
  { id: 'orders', label: 'Orders', icon: <Package size={16} />, group: 'main' },
  { id: 'products', label: 'Products', icon: <ShoppingBag size={16} />, group: 'store' },
  { id: 'collections', label: 'Collections', icon: <Tag size={16} />, group: 'store' },
  { id: 'customers', label: 'Customers', icon: <Users size={16} />, group: 'store' },
  { id: 'discounts', label: 'Discounts', icon: <Tag size={16} />, group: 'store' },
  { id: 'reviews', label: 'Reviews', icon: <Star size={16} />, group: 'store' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} />, group: 'system' },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Overview',
  store: 'Store',
  system: 'System',
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onNavigate,
  pendingCount,
  onLogout,
  adminName,
}) => {
  const groups = ['main', 'store', 'system'] as const;

  return (
    <aside className="adm-sidebar">
      {/* Brand */}
      <div className="adm-sidebar-brand">
        <img src={flowerLogo} alt="Wallflower" />
        <div>
          <div className="adm-sidebar-brand-name">Wallflower</div>
        </div>
        <span className="adm-sidebar-brand-badge">Admin</span>
      </div>

      {/* Navigation */}
      {groups.map((group) => {
        const items = NAV_ITEMS.filter((i) => i.group === group);
        return (
          <div key={group} className="adm-sidebar-section">
            <div className="adm-sidebar-section-label">{GROUP_LABELS[group]}</div>
            {items.map((item) => (
              <button
                key={item.id}
                className={`adm-sidebar-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'orders' && pendingCount > 0 && (
                  <span className="adm-sidebar-badge">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        );
      })}

      {/* Footer */}
      <div className="adm-sidebar-footer">
        <button
          className="adm-sidebar-item"
          onClick={() => { window.location.hash = '#home'; }}
          style={{ marginBottom: '8px', color: '#9CA3AF' }}
          title="Open Wallflower Customer Storefront"
        >
          <ExternalLink size={16} />
          <span>View Storefront</span>
        </button>

        <div style={{
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
          marginBottom: '8px', paddingLeft: '10px'
        }}>
          Signed in as {adminName}
        </div>
        <button
          className="adm-sidebar-item"
          onClick={onLogout}
          style={{ color: '#EF4444' }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
