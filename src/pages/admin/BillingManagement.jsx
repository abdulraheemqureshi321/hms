import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
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
  ShieldCheck,
  FileSpreadsheet,
  Search
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

export default function BillingManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (inv.booking?.bookingCode && inv.booking.bookingCode.toLowerCase().includes(query)) ||
      (inv.booking?.guest?.name && inv.booking.guest.name.toLowerCase().includes(query)) ||
      (inv.booking?.guest?.email && inv.booking.guest.email.toLowerCase().includes(query)) ||
      (inv.booking?.room?.roomNumber && inv.booking.room.roomNumber.toString().includes(query)) ||
      (inv.transactionId && inv.transactionId.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
    const matchesMethod = methodFilter === 'All' || inv.paymentMethod === methodFilter;

    let matchesDate = true;
    if (startDate && inv.createdAt) {
      const invTime = new Date(inv.createdAt).setHours(0,0,0,0);
      const startTime = new Date(startDate).setHours(0,0,0,0);
      if (invTime < startTime) matchesDate = false;
    }
    if (endDate && inv.createdAt) {
      const invTime = new Date(inv.createdAt).setHours(0,0,0,0);
      const endTime = new Date(endDate).setHours(23,59,59,999);
      if (invTime > endTime) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const handleExportExcel = () => {
    const exportData = filteredInvoices.map(inv => ({
      'Invoice / Booking Code': inv.booking?.bookingCode || 'N/A',
      'Guest Name': inv.booking?.guest?.name || 'Walk-in Guest',
      'Guest Email': inv.booking?.guest?.email || '',
      'Room Number': inv.booking?.room?.roomNumber || '',
      'Subtotal ($)': (inv.amount - (inv.taxAmount || 0)),
      'Tax & Surcharges ($)': inv.taxAmount || 0,
      'Discount ($)': inv.discountAmount || 0,
      'Total Amount ($)': inv.amount || 0,
      'Payment Status': inv.paymentStatus || '',
      'Payment Method': inv.paymentMethod || '',
      'Transaction ID': inv.transactionId || 'N/A',
      'Invoice Date': inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ''
    }));
    exportToExcel(exportData, `Billing_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`, 'Invoices');
  };

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

    socket.on('payment_updated', fetchInvoices);
    socket.on('booking_updated', fetchInvoices);
    socket.on('booking_created', fetchInvoices);

    return () => {
      socket.off('payment_updated', fetchInvoices);
      socket.off('booking_updated', fetchInvoices);
      socket.off('booking_created', fetchInvoices);
    };
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
      await api.put('/settings/tax', taxForm);
      setTaxMessage('Tax settings updated successfully!');
      setTimeout(() => setShowTaxModal(false), 1200);
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    } finally {
      setTaxSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '28px 24px', maxWidth: '1380px' }}>
      {/* Header */}
      <div className="responsive-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-eyebrow">Financial Operations</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#09090b', letterSpacing: '-0.025em' }}>
            Invoicing & Billing
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.84rem', marginTop: '2px' }}>
            Guest settlement ledger, automated itemized tax breakdowns, and payment records
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowTaxModal(true)}
            style={{ fontSize: '0.82rem', padding: '7px 12px' }}
          >
            <Settings size={14} /> Tax & Rates Config
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input
              type="text"
              style={{ width: '100%', paddingLeft: '32px', height: '36px', fontSize: '0.82rem', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '6px' }}
              placeholder="Search invoice, guest, room #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 10px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px', color: '#09090b' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 10px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px', color: '#09090b' }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Payment Methods</option>
            <option value="card">Credit / Debit Card</option>
            <option value="cash">Cash at Desk</option>
            <option value="online">Online Transfer</option>
            <option value="pay_at_hotel">Pay at Hotel</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>From:</span>
            <input
              type="date"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 8px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>To:</span>
            <input
              type="date"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem', padding: '0 8px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '6px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(searchQuery || statusFilter !== 'All' || methodFilter !== 'All' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setMethodFilter('All');
                setStartDate('');
                setEndDate('');
              }}
              className="btn btn-secondary"
              style={{ height: '36px', padding: '0 10px', fontSize: '0.78rem', color: '#71717a' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={handleExportExcel}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 12px', fontSize: '0.8rem' }}
        >
          <FileSpreadsheet size={15} /> Export Excel ({filteredInvoices.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa', fontSize: '0.85rem' }}>Loading Invoices...</div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Invoice / Code</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Subtotal</th>
                <th>Taxes & Fees</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#a1a1aa' }}>
                    No invoices found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const getStatusStyle = (s) => {
                    switch (s) {
                      case 'Paid': return { bg: '#f0fdf4', color: '#166534', dot: '#16a34a' };
                      case 'Refunded': return { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' };
                      default: return { bg: '#fffbeb', color: '#92400e', dot: '#d97706' };
                    }
                  };
                  const sStyle = getStatusStyle(inv.paymentStatus);

                  return (
                    <tr key={inv._id}>
                      <td className="font-mono" style={{ fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap' }}>
                        {inv.booking?.bookingCode || 'N/A'}
                      </td>
                      <td style={{ fontWeight: 500, color: '#09090b' }}>
                        {inv.booking?.guest?.name || 'Walk-in Guest'}
                      </td>
                      <td className="font-mono" style={{ color: '#52525b' }}>
                        Room {inv.booking?.room?.roomNumber || 'N/A'}
                      </td>
                      <td className="font-mono" style={{ color: '#52525b' }}>
                        ${(inv.amount - (inv.taxAmount || 0)).toLocaleString()}
                      </td>
                      <td className="font-mono" style={{ color: '#71717a' }}>
                        ${(inv.taxAmount || 0).toLocaleString()}
                      </td>
                      <td className="font-mono" style={{ fontWeight: 600, color: '#09090b' }}>
                        ${inv.amount?.toLocaleString()}
                      </td>
                      <td>
                        <span className="status-pill" style={{ background: sStyle.bg, color: sStyle.color, border: '1px solid rgba(0,0,0,0.04)' }}>
                          <span className="status-dot" style={{ background: sStyle.dot }} />
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setSelectedInvoice(inv)}
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          >
                            <Printer size={12} style={{ marginRight: '4px' }} /> View
                          </button>

                          {inv.paymentStatus !== 'Paid' && (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handlePay(inv._id)}
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            >
                              <CreditCard size={12} style={{ marginRight: '4px' }} /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', background: '#fff', padding: '32px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>INVOICE RECEIPT</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedInvoice.booking?.bookingCode}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="btn btn-secondary">Close</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Guest Name:</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.booking?.guest?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span>{selectedInvoice.booking?.guest?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Room #:</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.booking?.room?.roomNumber}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Room Charges:</span>
                <span>${(selectedInvoice.amount - (selectedInvoice.taxAmount || 0)).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
                <span>Govt Taxes & Service Fees:</span>
                <span>${(selectedInvoice.taxAmount || 0).toLocaleString()}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669' }}>
                  <span>Discount Applied:</span>
                  <span>-${selectedInvoice.discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginTop: '12px', borderTop: '2px solid #e2e8f0', paddingTop: '12px' }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--accent-primary)' }}>${selectedInvoice.amount?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ width: '100%' }}>
                <Printer size={16} style={{ marginRight: '8px' }} /> Print / Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Configuration Modal */}
      {showTaxModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', background: '#fff', padding: '32px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Tax & Service Rates</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Configure sales tax percentage and service surcharge applied to invoices
            </p>

            {taxMessage && (
              <div style={{ padding: '10px 14px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {taxMessage}
              </div>
            )}

            <form onSubmit={handleSaveTaxSettings}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Tax Designation</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={taxForm.taxName}
                  onChange={(e) => setTaxForm({ ...taxForm, taxName: e.target.value })}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Sales Tax Rate (%)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={taxForm.taxRate}
                    onChange={(e) => setTaxForm({ ...taxForm, taxRate: parseFloat(e.target.value) || 0 })}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Service Fee Rate (%)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={taxForm.serviceFeeRate}
                    onChange={(e) => setTaxForm({ ...taxForm, serviceFeeRate: parseFloat(e.target.value) || 0 })}
                    required 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={taxForm.isTaxEnabled} 
                    onChange={(e) => setTaxForm({ ...taxForm, isTaxEnabled: e.target.checked })} 
                  />
                  Enable Tax & Service Surcharges on Auto-Invoicing
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaxModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={taxSaving}>
                  {taxSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
