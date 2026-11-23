import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, Package, CheckCircle2,
  XCircle, DollarSign, BarChart2, ArrowUpRight, Eye, AlertTriangle
} from 'lucide-react';
import { getDashboardStats, getSalesData } from '../data/adminAnalytics';
import type { AdminOrder, AnalyticsPeriod } from '../types/admin';

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, iconBg, iconColor }) => (
  <div className="adm-stat-card">
    <div className="adm-stat-icon" style={{ background: iconBg, color: iconColor }}>
      {icon}
    </div>
    <div className="adm-stat-label">{label}</div>
    <div className="adm-stat-value">{value}</div>
    {sub && <div className="adm-stat-sub">{sub}</div>}
  </div>
);

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

interface RecentOrdersTableProps {
  orders: AdminOrder[];
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => (
  <div className="adm-table-wrap">
    <table className="adm-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: '32px' }}>
              No orders yet
            </td>
          </tr>
        ) : (
          orders.map((order) => (
            <tr key={order.id}>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4F7EF8', fontSize: '0.8rem' }}>
                  {order.id}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{order.shippingAddress?.fullName || '—'}</td>
              <td style={{ color: '#6B7280' }}>{order.date}</td>
              <td style={{ fontWeight: 700 }}>{fmt(order.amountPaid || order.total)}</td>
              <td>
                <span className={`adm-badge adm-badge-${order.adminStatus}`}>
                  {order.adminStatus}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export const Dashboard: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [stats, setStats] = useState(() => getDashboardStats());
  const [salesData, setSalesData] = useState(() => getSalesData('week'));

  useEffect(() => {
    setStats(getDashboardStats());
    setSalesData(getSalesData(period));
  }, [period]);

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);

  // Low-performance alert: visits up but orders flat (simulated)
  const showAlert = stats.liveVisitors > 10 && stats.todayOrders === 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="adm-section-title">Dashboard</h1>
          <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>
            Overview of your Wallflower store performance.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            <Eye size={12} style={{ display: 'inline', marginRight: 4 }} />
            {stats.liveVisitors} live visitors
          </span>
        </div>
      </div>

      {/* Low performance alert */}
      {showAlert && (
        <div className="adm-alert adm-alert-warning">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>Low Conversion Alert:</strong> You have {stats.liveVisitors} active visitors
            but no orders today. Consider reviewing your pricing or running a promotion.
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="adm-stats-grid">
        <StatCard
          label="Total Revenue"
          value={fmt(stats.totalRevenue)}
          sub="All completed orders"
          icon={<DollarSign size={18} />}
          iconBg="#EFF6FF"
          iconColor="#4F7EF8"
        />
        <StatCard
          label="Total Profit"
          value={fmt(stats.totalProfit)}
          sub="After product costs"
          icon={<TrendingUp size={18} />}
          iconBg="#F0FDF4"
          iconColor="#22C55E"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.pendingOrders} pending`}
          icon={<Package size={18} />}
          iconBg="#FEF9C3"
          iconColor="#A16207"
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders}
          sub="Awaiting confirmation"
          icon={<Package size={18} />}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
        />
        <StatCard
          label="Completed Orders"
          value={stats.completedOrders}
          sub="Submitted to Qikink"
          icon={<CheckCircle2 size={18} />}
          iconBg="#F0FDF4"
          iconColor="#22C55E"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelledOrders}
          icon={<XCircle size={18} />}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
        />
        <StatCard
          label="Total Accounts"
          value={stats.totalAccounts}
          icon={<Users size={18} />}
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
        />
        <StatCard
          label="Avg Order Value"
          value={fmt(stats.averageOrderValue)}
          icon={<BarChart2 size={18} />}
          iconBg="#FFF7ED"
          iconColor="#EA580C"
        />
        <StatCard
          label="Today's Sales"
          value={fmt(stats.todaySales)}
          sub={`${stats.todayOrders} orders today`}
          icon={<DollarSign size={18} />}
          iconBg="#EFF6FF"
          iconColor="#4F7EF8"
        />
      </div>

      {/* Sales Graph + Recent Orders */}
      <div className="adm-row" style={{ gap: 20 }}>
        {/* Sales Graph */}
        <div style={{ flex: '1 1 60%' }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Sales Overview</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['day', 'week', 'month', 'year'] as AnalyticsPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: period === p ? '#4F7EF8' : '#E5E7EB',
                      background: period === p ? '#EFF6FF' : 'transparent',
                      color: period === p ? '#4F7EF8' : '#6B7280',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="adm-card-body">
              {/* Bar chart */}
              <div className="adm-graph-wrap">
                <div className="adm-graph-bars">
                  {salesData.map((d) => (
                    <div key={d.label} className="adm-graph-bar-group" title={`${d.label}: Revenue ${fmt(d.revenue)}, Profit ${fmt(d.profit)}`}>
                      <div style={{ display: 'flex', gap: 2, flex: 1, alignItems: 'flex-end', width: '100%' }}>
                        <div
                          className="adm-graph-bar revenue"
                          style={{ height: `${(d.revenue / maxRevenue) * 130}px`, flex: 1 }}
                        />
                        <div
                          className="adm-graph-bar profit"
                          style={{ height: `${(d.profit / maxRevenue) * 130}px`, flex: 1 }}
                        />
                      </div>
                      <span className="adm-graph-label">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="adm-graph-legend">
                  <div className="adm-graph-legend-item">
                    <div className="adm-graph-legend-dot" style={{ background: '#4F7EF8' }} />
                    Revenue
                  </div>
                  <div className="adm-graph-legend-item">
                    <div className="adm-graph-legend-dot" style={{ background: '#22C55E' }} />
                    Profit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ flex: '1 1 36%' }}>
          <div className="adm-card" style={{ marginBottom: 16 }}>
            <div className="adm-card-header">
              <span className="adm-card-title">Quick Actions</span>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'View Pending Orders', view: 'orders', badge: stats.pendingOrders },
                { label: 'Manage Products', view: 'products', badge: null },
                { label: 'View Customers', view: 'customers', badge: null },
                { label: 'Create Discount', view: 'discounts', badge: null },
              ].map(({ label, view, badge }) => (
                <button
                  key={view}
                  className="adm-btn-secondary"
                  style={{ justifyContent: 'space-between', width: '100%' }}
                  onClick={() => onNavigate(view)}
                >
                  <span>{label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {badge != null && badge > 0 && (
                      <span style={{
                        background: '#EF4444', color: '#fff', borderRadius: 10,
                        fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px'
                      }}>{badge}</span>
                    )}
                    <ArrowUpRight size={14} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="adm-card" style={{ marginTop: 20 }}>
        <div className="adm-card-header">
          <span className="adm-card-title">Recent Orders</span>
          <button className="adm-btn-secondary" onClick={() => onNavigate('orders')}>
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <RecentOrdersTable orders={stats.recentOrders as AdminOrder[]} />
      </div>
    </div>
  );
};
