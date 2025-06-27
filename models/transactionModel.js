const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  paymentId: { type: String,},     // Razorpay Payment ID
  orderId: { type: String},                      // Razorpay Order ID
  amount: { type: Number},                       // In paise (e.g., 50000 = ₹500)
  currency: { type: String, default: 'INR' },
  status: { type: String},                       // captured, failed, etc.
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },  // Optional: link to user
  upiId:String,
  flag:{
    type:Boolean,
    default:false
  }
})

module.exports = mongoose.model('Transaction', transactionSchema);