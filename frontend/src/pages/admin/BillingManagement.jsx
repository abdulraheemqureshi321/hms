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
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1400px' }}>
      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            Billing & <span className="text-gradient">Invoicing Engine</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Automated itemized invoice calculation with real-time tax breakdown & audit log
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowTaxModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={18} /> Tax & Rates Config
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px', background: '#ffffff', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
              placeholder="Search by Invoice Code, Guest Name, Room #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            className="input-field"
            style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 12px' }}
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>From:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 10px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>To:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: 'auto', height: '40px', fontSize: '0.85rem', padding: '0 10px' }}
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
              style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '0 6px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={handleExportExcel}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 16px', background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 700 }}
        >
          <FileSpreadsheet size={18} /> Export Excel ({filteredInvoices.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Invoices...</div>
      ) : (
        <div className="table-responsive">
          <table className="glass-panel" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>INV CODE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>GUEST NAME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ROOM</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SUBTOTAL</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TAX & FEES</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOTAL</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No invoices found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                <tr key={inv._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{inv.booking?.bookingCode || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>{inv.booking?.guest?.name || 'Walk-in Guest'}</td>
                  <td style={{ padding: '16px' }}>Room {inv.booking?.room?.roomNumber || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>${(inv.amount - (inv.taxAmount || 0)).toLocaleString()}</td>
                  <td style={{ padding: '16px' }}>${(inv.taxAmount || 0).toLocaleString()}</td>
                  <td style={{ padding: '16px', fontWeight: 700, color: 'var(--accent-primary)' }}>${inv.amount?.toLocaleString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-confirmed' : inv.paymentStatus === 'Refunded' ? 'badge-cancelled' : 'badge-pending'}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setSelectedInvoice(inv)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <Printer size={14} style={{ marginRight: '6px' }} /> View Invoice
                      </button>

                      {inv.paymentStatus !== 'Paid' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handlePay(inv._id)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          <CreditCard size={14} style={{ marginRight: '6px' }} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
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
