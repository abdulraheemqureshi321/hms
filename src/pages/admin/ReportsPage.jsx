import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TrendingUp, DollarSign, Layers, RefreshCw } from 'lucide-react';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const data = await api.get('/reports/dashboard');
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#a1a1aa', fontSize: '0.85rem' }}>
        Loading executive reports & channel metrics...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1380px' }}>
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">Executive Intelligence</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.025em' }}>
            Reports & Analytics
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.84rem', marginTop: '2px' }}>
            Occupancy distribution, channel distribution mix, and revenue performance
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadReports} style={{ fontSize: '0.82rem', padding: '7px 12px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid-cols-3" style={{ gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Occupancy Rate</h3>
          </div>
          <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>
            {metrics?.occupancyRate || 0}%
          </div>
          <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '8px', lineHeight: 1.5 }}>
            {metrics?.occupiedRooms} occupied and {metrics?.reservedRooms} reserved out of {metrics?.totalRooms} keys.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eaf6f0', color: '#0b5e39', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Gross Invoiced Revenue</h3>
          </div>
          <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 700, color: '#0b5e39' }}>
            PKR {metrics?.totalRevenue?.toLocaleString() || 0}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '8px', lineHeight: 1.5 }}>
            Settled across paid reservations and direct front-desk invoicing.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', color: '#c89535', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Channel Mix</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0b5e39' }} />
                Online Portal:
              </span>
              <span className="font-mono" style={{ fontWeight: 600, color: '#0f172a' }}>{metrics?.sourceBreakdown?.portal || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c89535' }} />
                Front-Desk Walk-Ins:
              </span>
              <span className="font-mono" style={{ fontWeight: 600, color: '#0f172a' }}>{metrics?.sourceBreakdown?.walkIn || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                Phone Bookings:
              </span>
              <span className="font-mono" style={{ fontWeight: 600, color: '#0f172a' }}>{metrics?.sourceBreakdown?.phone || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
