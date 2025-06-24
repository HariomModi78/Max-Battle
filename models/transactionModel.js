const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },     // Razorpay Payment ID
  orderId: { type: String, required: true },                      // Razorpay Order ID
  amount: { type: Number, required: true },                       // In paise (e.g., 50000 = ₹500)
  currency: { type: String, default: 'INR' },
  status: { type: String, required: true },                       // captured, failed, etc.
  method: { type: String },                                       // upi, card, netbanking, etc.
  bank: { type: String },                                         // If applicable
  wallet: { type: String },
  vpa: { type: String },                                          // UPI address if method is upi
  email: { type: String },
  contact: { type: String },
  fee: { type: Number },                                          // Razorpay fee in paise
  tax: { type: Number },                                          // GST on fee
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Optional: link to user
  description: { type: String },
  notes: { type: Object },                                        // Extra Razorpay notes
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);