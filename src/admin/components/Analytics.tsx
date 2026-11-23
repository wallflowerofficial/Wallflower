import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign } from 'lucide-react';
import { getSalesData, getDashboardStats, getBestSellingProducts, getPopularSizes } from '../data/adminAnalytics';
import type { AnalyticsPeriod, SalesDataPoint } from '../types/admin';

const PERIODS: AnalyticsPeriod[] = ['day', 'week', 'month', 'year'];
const PERIOD_LABELS: Record<AnalyticsPeriod, string> = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

const BarChartSection: React.FC<{ data: SalesDataPoint[]; metric: 'revenue' | 'profit' | 'orders' }> = ({ data, metric }) => {
  const max = Math.max(...data.map((d) => d[metric]), 1);
  const color = metric === 'revenue' ? '#4F7EF8' : metric === 'profit' ? '#22C55E' : '#F59E0B';

  return (
    <div className="adm-graph-bars" style={{ height: 180 }}>
      {data.map((d) => (
        <div key={d.label} className="adm-graph-bar-group"
          title={`${d.label}: ${metric === 'orders' ? d[metric] + ' orders' : fmt(d[metric] as number)}`}>
          <div
            className="adm-graph-bar"
            style={{ background: color, height: `${((d[metric] as number) / max) * 160}px`, width: '100%' }}
          />
          <span className="adm-graph-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [stats, setStats] = useState(() => getDashboardStats());
  const [bestSellers, setBestSellers] = useState(() => getBestSellingProducts());
  const [popularSizes, setPopularSizes] = useState(() => getPopularSizes());

  useEffect(() => {
    setSalesData(getSalesData(period));
    setStats(getDashboardStats());
    setBestSellers(getBestSellingProducts());
    setPopularSizes(getPopularSizes());
  }, [period]);

  const totalSizeOrders = popularSizes.A3 + popularSizes.A4 + popularSizes.A5 || 1;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-section-title">Analytics</h1>
        <p className="adm-section-subtitle" style={{ marginBottom: 0 }}>Sales, profit, and product performance.</p>
      </div>

      {/* Quick Summary Pill Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="adm-stat-card" style={{ padding: '14px 18px' }}>
          <div className="adm-stat-label">Total Revenue</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4F7EF8' }}>{fmt(stats.totalRevenue)}</div>
        </div>
        <div className="adm-stat-card" style={{ padding: '14px 18px' }}>
          <div className="adm-stat-label">Total Profit</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E' }}>{fmt(stats.totalProfit)}</div>
        </div>
        <div className="adm-stat-card" style={{ padding: '14px 18px' }}>
          <div className="adm-stat-label">Completed Orders</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.completedOrders}</div>
        </div>
        <div className="adm-stat-card" style={{ padding: '14px 18px' }}>
          <div className="adm-stat-label">Avg Order Value</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{fmt(stats.averageOrderValue)}</div>
        </div>
      </div>

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {PERIODS.map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{
              padding: '7px 16px', borderRadius: 7, border: '1.5px solid',
              borderColor: period === p ? '#4F7EF8' : '#E5E7EB',
              background: period === p ? '#EFF6FF' : '#fff',
              color: period === p ? '#4F7EF8' : '#6B7280',
              fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="adm-row" style={{ gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div style={{ flex: '1 1 50%' }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={16} color="#4F7EF8" /> Revenue
              </span>
              <span style={{ fontWeight: 800, color: '#111318' }}>
                {fmt(salesData.reduce((s, d) => s + d.revenue, 0))}
              </span>
            </div>
            <div className="adm-card-body">
              <div className="adm-graph-wrap">
                <BarChartSection data={salesData} metric="revenue" />
              </div>
            </div>
          </div>
        </div>

        {/* Profit Chart */}
        <div style={{ flex: '1 1 50%' }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} color="#22C55E" /> Profit
              </span>
              <span style={{ fontWeight: 800, color: '#111318' }}>
                {fmt(salesData.reduce((s, d) => s + d.profit, 0))}
              </span>
            </div>
            <div className="adm-card-body">
              <div className="adm-graph-wrap">
                <BarChartSection data={salesData} metric="profit" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="adm-row" style={{ gap: 20, marginBottom: 20 }}>
        {/* Orders Chart */}
        <div style={{ flex: '1 1 50%' }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={16} color="#F59E0B" /> Orders
              </span>
              <span style={{ fontWeight: 800 }}>{salesData.reduce((s, d) => s + d.orders, 0)}</span>
            </div>
            <div className="adm-card-body">
              <div className="adm-graph-wrap">
                <BarChartSection data={salesData} metric="orders" />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Sizes */}
        <div style={{ flex: '1 1 50%' }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Popular Sizes</span>
            </div>
            <div className="adm-card-body">
              {(['A3', 'A4', 'A5'] as const).map((size) => {
                const count = popularSizes[size];
                const pct = Math.round((count / totalSizeOrders) * 100);
                return (
                  <div key={size} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700 }}>{size}</span>
                      <span style={{ color: '#6B7280' }}>{count} posters ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: size === 'A3' ? '#4F7EF8' : size === 'A4' ? '#22C55E' : '#F59E0B',
                        width: `${pct}%`, transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title">Best-Selling Posters</span>
        </div>
        {bestSellers.length === 0 ? (
          <div className="adm-empty-state" style={{ padding: '32px' }}>
            <div className="adm-empty-title">No sales data yet</div>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Poster</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#9CA3AF', fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{p.id}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.qty}</td>
                    <td style={{ fontWeight: 700, color: '#4F7EF8' }}>{fmt(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
