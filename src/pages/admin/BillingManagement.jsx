import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CreditCard, Printer, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function BillingManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      const data = await api.get('/billing/invoices');
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (invoiceId) => {
    try {
      await api.put(`/billing/payment/${invoiceId}`, { paymentStatus: 'Paid' });
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Billing & <span className="text-gradient">Invoicing Center</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Automated tax calculation, payment status tracking, and printable receipts
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>BOOKING REF</th>
              <th style={{ padding: '12px' }}>GUEST NAME</th>
              <th style={{ padding: '12px' }}>METHOD</th>
              <th style={{ padding: '12px' }}>TAX (10%)</th>
              <th style={{ padding: '12px' }}>TOTAL AMOUNT</th>
              <th style={{ padding: '12px' }}>PAYMENT STATUS</th>
              <th style={{ padding: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 12px', fontWeight: '700', color: 'var(--accent-secondary)' }}>
                  {inv.booking?.bookingCode}
                </td>
                <td style={{ padding: '16px 12px', fontWeight: '600', color: '#fff' }}>
                  {inv.booking?.guest?.name}
                </td>
                <td style={{ padding: '16px 12px', textTransform: 'capitalize' }}>
                  {inv.paymentMethod.replace('_', ' ')}
                </td>
                <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>
                  ${inv.taxAmount}
                </td>
                <td style={{ padding: '16px 12px', fontWeight: '800', color: '#fff' }}>
                  ${inv.amount}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: inv.paymentStatus === 'Paid' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: inv.paymentStatus === 'Paid' ? '#4ade80' : '#fbbf24'
                  }}>
                    {inv.paymentStatus}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {inv.paymentStatus === 'Pending' && (
                      <button className="btn btn-secondary" onClick={() => handlePay(inv._id)} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                        Mark as Paid
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => setSelectedInvoice(inv)} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      <Printer size={12} /> View Receipt
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: '#111827' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>OFFICIAL HOTEL RECEIPT</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CareHaven Hotel Management System</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Code:</span>
                <span style={{ fontWeight: '700' }}>{selectedInvoice.booking?.bookingCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Guest Name:</span>
                <span>{selectedInvoice.booking?.guest?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Room Number:</span>
                <span>Room {selectedInvoice.booking?.room?.roomNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (10%):</span>
                <span>${selectedInvoice.taxAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <span>Total Paid:</span>
                <span className="text-gradient">${selectedInvoice.amount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>Print Receipt</button>
              <button className="btn btn-primary" onClick={() => setSelectedInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
