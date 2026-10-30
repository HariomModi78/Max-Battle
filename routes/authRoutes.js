const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authLimiter } = require("../middlewares/rateLimiter");

// Home/Landing & Session Check
router.get("/", authController.getRoot);

// Registration
router.get("/register", authController.getRegister);
router.post("/registerOtp", authLimiter, authController.postRegisterOtp);
router.get("/registerOtp", authController.getRegisterOtp);
router.post("/verifyRegisterOtp", authController.verifyRegisterOtp);

// Referral Codes List
router.get("/referralCodes", authController.getReferralCodes);

// Authentication
router.get("/login", authController.getLogin);
router.post("/login", authLimiter, authController.postLogin);
router.get("/logout", authController.logout);

// Password Reset / Recovery
router.get("/formatePassword", authController.getForgotPassword);
router.post("/formatePassword", authController.postForgotPassword);
router.get("/otp", authController.getOtp);
router.post("/verifyOtp", authLimiter, authController.postVerifyOtp);

module.exports = router;
