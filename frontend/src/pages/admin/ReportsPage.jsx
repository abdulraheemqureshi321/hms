import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart3, TrendingUp, Users, DollarSign, Layers } from 'lucide-react';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await api.get('/reports/dashboard');
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
          Executive <span className="text-gradient">Reporting & Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
          Occupancy distribution, channel performance, and revenue trends
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-primary)" /> Occupancy Summary
          </h3>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a' }}>
            {metrics?.occupancyRate || 0}%
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Currently {metrics?.occupiedRooms} occupied and {metrics?.reservedRooms} reserved out of {metrics?.totalRooms} total rooms.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="#059669" /> Revenue Total
          </h3>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#059669' }}>
            PKR {metrics?.totalRevenue?.toLocaleString() || 0}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Accrued across paid invoices and room reservations.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#9333ea" /> Channel Mix
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Online Portal:</span>
              <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.portal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Walk-Ins:</span>
              <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.walkIn}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Phone Reservations:</span>
              <span style={{ fontWeight: '700' }}>{metrics?.sourceBreakdown?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
