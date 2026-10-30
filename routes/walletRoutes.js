const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");

// Wallet Views & Operations
router.get("/wallet/:userId", walletController.getWallet);
router.get("/deposit/:userId", walletController.getDeposit);
router.get("/withdraw/:userId", walletController.getWithdraw);
router.post("/withdraw/:userId", walletController.postWithdraw);
router.get("/transaction/:userId", walletController.getTransactions);

// Razorpay Order Creation & Verification
router.post("/create-order", walletController.createOrder);
router.get("/payment-success", walletController.getPaymentSuccess);
router.post("/verify-payment", walletController.verifyPayment);

// Razorpay Server-to-Server Webhook
router.post("/paymentCheck/razorpay", express.json({ type: "*/*" }), walletController.handleRazorpayWebhook);

module.exports = router;
