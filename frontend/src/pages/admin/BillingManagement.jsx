import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  Printer, 
  CheckCircle, 
  Clock, 
  Settings, 
  Percent, 
  FileText, 
  Save, 
  Calculator,
  ShieldCheck
} from 'lucide-react';

export default function BillingManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Tax Management Modal State
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxForm, setTaxForm] = useState({
    taxName: 'GST / Sales Tax',
    taxRate: 16,
    serviceFeeRate: 5,
    ntnNumber: '7920143-5',
    isTaxEnabled: true
  });
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxMessage, setTaxMessage] = useState('');

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

  const fetchTaxSettings = async () => {
    try {
      const settings = await api.get('/settings/tax');
      if (settings) {
        setTaxForm({
          taxName: settings.taxName || 'GST / Sales Tax',
          taxRate: settings.taxRate !== undefined ? settings.taxRate : 16,
          serviceFeeRate: settings.serviceFeeRate !== undefined ? settings.serviceFeeRate : 5,
          ntnNumber: settings.ntnNumber || '7920143-5',
          isTaxEnabled: settings.isTaxEnabled !== undefined ? settings.isTaxEnabled : true
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchTaxSettings();
  }, []);

  const handlePay = async (invoiceId) => {
    try {
      await api.put(`/billing/payment/${invoiceId}`, { paymentStatus: 'Paid' });
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveTaxSettings = async (e) => {
    e.preventDefault();
    setTaxSaving(true);
    setTaxMessage('');
    try {
      const res = await api.put('/settings/tax', taxForm);
      setTaxMessage(res.message || 'Tax & Service Fee settings updated successfully!');
      setTimeout(() => setTaxMessage(''), 3000);
      fetchInvoices();
    } catch (err) {
      setTaxMessage(err.message || 'Failed to update tax settings');
    } finally {
      setTaxSaving(false);
    }
  };

  // Live Sample Room Calculation
  const sampleBase = 10000;
  const sampleTax = taxForm.isTaxEnabled ? Math.round(sampleBase * (taxForm.taxRate / 100)) : 0;
  const { hasPermission } = useAuth();
  const sampleService = taxForm.isTaxEnabled ? Math.round(sampleBase * (taxForm.serviceFeeRate / 100)) : 0;
  const sampleTotal = sampleBase + sampleTax + sampleService;

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
            Billing & <span className="text-gradient">Invoicing Center</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Automated tax calculation, payment status tracking, and printable receipts
          </p>
        </div>

        {/* Action Button: Configure Taxes */}
        {hasPermission('billing', 'edit') && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowTaxModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}
          >
            <Settings size={18} /> Tax & Service Fee Settings
          </button>
        )}
      </div>

      {/* Tax Quick Summary Widget */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Active Tax System</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: taxForm.isTaxEnabled ? 'var(--accent-primary)' : '#64748b', marginTop: '4px' }}>
            {taxForm.isTaxEnabled ? 'ENABLED' : 'DISABLED'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{taxForm.taxName} ({taxForm.taxRate}%)</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Service Charge Rate</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
            {taxForm.serviceFeeRate}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>Luxury & Service Maintenance Fee</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Tax Registration (NTN)</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            {taxForm.ntnNumber || 'N/A'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>FBR Official Hotel NTN</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>BOOKING REF</th>
              <th style={{ padding: '12px' }}>GUEST NAME</th>
              <th style={{ padding: '12px' }}>METHOD</th>
              <th style={{ padding: '12px' }}>TAX & FEES</th>
              <th style={{ padding: '12px' }}>TOTAL AMOUNT</th>
              <th style={{ padding: '12px' }}>PAYMENT STATUS</th>
              <th style={{ padding: '12px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No billing invoices found.
                </td>
              </tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  <td style={{ padding: '16px 12px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    {inv.booking?.bookingCode}
                  </td>
                  <td style={{ padding: '16px 12px', fontWeight: '600', color: '#0f172a' }}>
                    {inv.booking?.guest?.name}
                  </td>
                  <td style={{ padding: '16px 12px', textTransform: 'capitalize', color: '#334155' }}>
                    {inv.paymentMethod?.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>
                    PKR {inv.taxAmount}
                  </td>
                  <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>
                    PKR {inv.amount}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: inv.paymentStatus === 'Paid' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                      color: inv.paymentStatus === 'Paid' ? '#059669' : '#d97706'
                    }}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {hasPermission('billing', 'edit') && inv.paymentStatus === 'Pending' && (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tax & Service Fee Settings Modal */}
      {showTaxModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                  <Percent size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>Tax & Service Fee Settings</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure government PST/GST rates and hotel service fees</div>
                </div>
              </div>
            </div>

            {taxMessage && (
              <div style={{ padding: '12px', borderRadius: '8px', background: taxMessage.includes('successfully') ? 'rgba(5, 150, 105, 0.1)' : 'rgba(225, 29, 72, 0.1)', color: taxMessage.includes('successfully') ? '#059669' : '#e11d48', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '600' }}>
                {taxMessage}
              </div>
            )}

            <form onSubmit={handleSaveTaxSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Enable / Disable Tax Switch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Enable Tax Calculation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Apply taxes automatically on guest bookings & invoices</div>
                </div>
                <input
                  type="checkbox"
                  checked={taxForm.isTaxEnabled}
                  onChange={e => setTaxForm({ ...taxForm, isTaxEnabled: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#059669', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tax Label / Name</label>
                  <input
                    type="text"
                    required
                    value={taxForm.taxName}
                    onChange={e => setTaxForm({ ...taxForm, taxName: e.target.value })}
                    placeholder="e.g. GST / Sales Tax"
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tax Rate (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxForm.taxRate}
                    onChange={e => setTaxForm({ ...taxForm, taxRate: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Service Charge Rate (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxForm.serviceFeeRate}
                    onChange={e => setTaxForm({ ...taxForm, serviceFeeRate: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tax Registration (NTN)</label>
                  <input
                    type="text"
                    value={taxForm.ntnNumber}
                    onChange={e => setTaxForm({ ...taxForm, ntnNumber: e.target.value })}
                    placeholder="e.g. 7920143-5"
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div style={{ padding: '16px', background: 'rgba(5, 150, 105, 0.05)', borderRadius: '12px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#059669', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calculator size={16} /> Live Sample Invoice Preview (Room Price PKR 10,000)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Room Night Stay:</span>
                    <span>PKR 10,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{taxForm.taxName} ({taxForm.isTaxEnabled ? taxForm.taxRate : 0}%):</span>
                    <span>PKR {sampleTax.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Service Charge ({taxForm.isTaxEnabled ? taxForm.serviceFeeRate : 0}%):</span>
                    <span>PKR {sampleService.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0f172a', paddingTop: '6px', borderTop: '1px solid rgba(5, 150, 105, 0.2)', fontSize: '0.95rem' }}>
                    <span>Total Billing Amount:</span>
                    <span>PKR {sampleTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaxModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={taxSaving}>
                  <Save size={16} /> {taxSaving ? 'Saving...' : 'Save Tax Settings'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px' }}>CAREHAVEN LUXURY HOTEL</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Clifton Phase 8, Karachi, Pakistan • Tel: +92 21 111 227 342</div>
              <div style={{ display: 'inline-block', margin: '8px 0 0 0', padding: '3px 10px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                FBR TAX NTN REGISTRATION: {taxForm.ntnNumber || '7920143-5'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', fontSize: '0.85rem', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Guest Details</div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{selectedInvoice.booking?.guest?.name || 'Walk-In Guest'}</div>
                <div style={{ color: '#475569' }}>Email: {selectedInvoice.booking?.guest?.email || 'N/A'}</div>
                <div style={{ color: '#475569' }}>Phone: {selectedInvoice.booking?.guest?.phone || 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Invoice Metadata</div>
                <div style={{ fontWeight: '800', color: '#059669' }}>REF: {selectedInvoice.booking?.bookingCode || selectedInvoice._id}</div>
                <div style={{ color: '#475569' }}>Room #{selectedInvoice.booking?.room?.roomNumber || '101'}</div>
                <div style={{ color: '#475569' }}>Date: {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Complete Itemized Billing Table */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                Complete Summary of Bill
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', color: '#334155' }}>Description</th>
                    <th style={{ padding: '8px 10px', color: '#334155', textAlign: 'right' }}>Rate / Calc</th>
                    <th style={{ padding: '8px 10px', color: '#334155', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const totalPaid = selectedInvoice.amount || 0;
                    const taxAndFee = selectedInvoice.taxAmount || 0;
                    const baseCharge = Math.max(0, totalPaid - taxAndFee);
                    const estimatedTax = Math.round(baseCharge * ((taxForm.taxRate || 16) / 100));
                    const estimatedService = Math.max(0, taxAndFee - estimatedTax);

                    return (
                      <>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>Room Stay Charge</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room {selectedInvoice.booking?.room?.roomNumber || '101'}</div>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>Base Stay</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>PKR {baseCharge.toLocaleString()}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: '600', color: '#334155' }}>{taxForm.taxName || 'GST / Sales Tax'}</div>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>{taxForm.taxRate}% Rate</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>PKR {estimatedTax.toLocaleString()}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: '600', color: '#334155' }}>Hotel Service Fee</div>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>{taxForm.serviceFeeRate}% Rate</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>PKR {estimatedService.toLocaleString()}</td>
                        </tr>
                        <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                          <td style={{ padding: '12px 10px', fontSize: '0.95rem', color: '#0f172a' }}>GRAND TOTAL BILL</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: selectedInvoice.paymentStatus === 'Paid' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)', color: selectedInvoice.paymentStatus === 'Paid' ? '#059669' : '#d97706' }}>
                              {selectedInvoice.paymentStatus?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: '1.1rem', color: '#059669' }}>
                            PKR {totalPaid.toLocaleString()}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Printer size={16} /> Print Full Receipt
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
