import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Payment.find()
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest' },
          { path: 'room' },
          { path: 'roomType' }
        ]
      })
      .sort({ createdAt: -1 });

    // Auto-sync payment status to 'Paid' for checked-out bookings
    for (let inv of invoices) {
      if (inv.booking && inv.booking.status === 'Checked-Out' && inv.paymentStatus === 'Pending') {
        inv.paymentStatus = 'Paid';
        if (!inv.transactionId) {
          inv.transactionId = 'TXN-' + Date.now();
        }
        await inv.save();
      }
    }

    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInvoiceByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ booking: bookingId })
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest' },
          { path: 'room' },
          { path: 'roomType' }
        ]
      });

    if (!payment) {
      return res.status(404).json({ message: 'Invoice not found for this booking' });
    }

    return res.json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, paymentStatus, discountAmount } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (paymentStatus) payment.paymentStatus = paymentStatus;
    if (discountAmount !== undefined) {
      payment.discountAmount = discountAmount;
      payment.amount = Math.max(0, payment.amount - discountAmount);
    }
    if (paymentStatus === 'Paid' && !payment.transactionId) {
      payment.transactionId = 'TXN-' + Date.now();
    }

    await payment.save();
    return res.json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
