const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");
const { razorpay, WEBHOOK_SECRET } = require("../config/razorpay");
const userDataBase = require("../models/userModel");
const transactionDataBase = require("../models/transactionModel");
const notificationDataBase = require("../models/notification");
const emailService = require("../services/emailService");

// Helper for local JSON order backups
const ordersFile = path.join(__dirname, "../orders.json");
const readOrders = () => {
  return fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile)) : [];
};
const writeOrders = (data) => {
  fs.writeFileSync(ordersFile, JSON.stringify(data, null, 2));
};

const walletController = {
  // GET /wallet/:userId
  getWallet: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (user) {
        const notification = await notificationDataBase.find({ userId: req.params.userId, seen: false }).lean();
        res.render("wallet", { user, notification: notification.length });
      } else {
        res.redirect("/error");
      }
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /deposit/:userId
  getDeposit: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      res.render("deposit", { user });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /withdraw/:userId
  getWithdraw: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      res.cookie("ad", "ba");
      res.render("withdraw", { user });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /withdraw/:userId
  postWithdraw: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const amount = Number(req.body.amount);

      if (user.winning >= amount && amount >= 3) {
        const charges = (amount * 3) / 100;
        const netAmount = amount - charges;

        await userDataBase.findOneAndUpdate(
          { _id: user._id },
          {
            $inc: {
              totalBalance: -amount,
              winning: -amount,
            },
          }
        );

        const random = Date.now();
        await transactionDataBase.create({
          paymentId: random,
          upiId: user.upi[0],
          amount: netAmount,
          status: "withdraw",
          userId: user._id,
        });

        await notificationDataBase.create({
          title: "Withdraw🎉",
          message: `⚙️ Hi ${user.username}, your ₹${netAmount} withdrawal is being processed. You'll be notified once it's completed. 🕒`,
          userId: req.params.userId,
        });

        const detail = {
          amount: netAmount,
          username: user.username,
          upi: user.upi[0],
          email: user.email,
        };

        const admins = await userDataBase.find({ role: "admin" }).lean();
        for (let i = 0; i < admins.length; i++) {
          emailService.sendRequest(admins[i].email, "New Withdrawal Request Received", detail);
        }
      }

      res.cookie("wi", "wi");
      res.redirect(`/transaction/${req.params.userId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /transaction/:userId
  getTransactions: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const transaction = await transactionDataBase.find({ userId: user._id }).sort({ createdAt: -1 });
      let status = false;
      if (req.cookies.wi === "wi") {
        status = true;
        res.cookie("wi", "iw");
      }
      res.render("transaction", { user, transaction, status });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /create-order
  createOrder: async (req, res) => {
    try {
      const { amount, currency, receipt, notes } = req.body;

      const options = {
        amount: amount * 100, // paise
        currency: currency || "INR",
        receipt,
        notes,
      };

      const order = await razorpay.orders.create(options);
      const orders = readOrders();
      orders.push({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: "created",
      });
      writeOrders(orders);

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "error creating order" });
    }
  },

  // GET /payment-success
  getPaymentSuccess: (req, res) => {
    res.sendFile(path.join(__dirname, "../public/success.html"));
  },

  // POST /verify-payment
  verifyPayment: (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const isValid = validateWebhookSignature(body, razorpay_signature, razorpay.key_secret);
    if (!isValid) {
      return res.status(400).json({ status: "verification_failed" });
    }

    const orders = readOrders();
    const order = orders.find((o) => o.order_id === razorpay_order_id);

    if (order) {
      order.status = "paid";
      order.razorpay_payment_id = razorpay_payment_id;
      order.razorpay_signature = razorpay_signature;
      order.paidAt = new Date().toISOString();
      writeOrders(orders);

      const txnsFile = path.join(__dirname, "../transactions.json");
      const txns = fs.existsSync(txnsFile) ? JSON.parse(fs.readFileSync(txnsFile)) : [];
      txns.push({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: order.amount,
        currency: order.currency,
        paidAt: order.paidAt,
      });
      fs.writeFileSync(txnsFile, JSON.stringify(txns, null, 2));

      return res.status(200).json({ status: "ok", payment_id: razorpay_payment_id });
    } else {
      return res.status(404).json({ status: "order_not_found" });
    }
  },

  // POST /paymentCheck/razorpay (Webhook)
  handleRazorpayWebhook: async (req, res) => {
    try {
      const razorpaySignature = req.headers["x-razorpay-signature"];
      const body = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      if (razorpaySignature === expectedSignature) {
        const payment = req.body.payload.payment.entity;

        const alreadyExists = await transactionDataBase.findOne({ paymentId: payment.id });
        if (!alreadyExists) {
          const creditedAmount = payment.amount / 100;

          await transactionDataBase.create({
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: creditedAmount,
            status: payment.status,
            userId: payment.notes.userId,
          });

          await notificationDataBase.create({
            title: "Deposit💰",
            message: `₹${creditedAmount} added to your wallet. Ready to conquer the battleground? 🔥`,
            userId: payment.notes.userId,
          });

          await userDataBase.findOneAndUpdate(
            { _id: payment.notes.userId },
            {
              $inc: {
                totalBalance: creditedAmount,
                deposited: creditedAmount,
              },
            }
          );

          const user = await userDataBase.findOne({ _id: payment.notes.userId }).lean();
          if (user?.email && user.emailPermission) {
            emailService.sendDeposit(user.email, "Deposit💰", creditedAmount);
          }
        }

        return res.status(200).json({ status: "ok" });
      } else {
        return res.status(400).json({ error: "Invalid signature" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = walletController;
