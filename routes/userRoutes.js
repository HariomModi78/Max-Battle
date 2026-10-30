const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Health check
router.get("/ping", userController.getPing);

// Dashboard & Profile
router.get("/home/:userId", userController.getHome);
router.get("/profile/:userId", userController.getProfile);
router.get("/editProfile/:userId", userController.getEditProfile);
router.post("/changeDetail/:userId", userController.postChangeDetail);
router.post("/resetPassword/:userId", userController.postResetPassword);

// Leaderboard & Referral
router.get("/leadboard/:userId", userController.getLeaderboard);
router.get("/referAndEarn/:userId", userController.getReferAndEarn);
router.get("/confirmBonus/:userId", userController.getConfirmBonus);

// Settings & Preferences
router.post("/emailPermission/:userId", userController.postEmailPermission);
router.post("/userUpi/:userId", userController.postUserUpi);

// Notifications
router.get("/notification/:userId", userController.getNotifications);
router.post("/seenTrue", userController.markNotificationSeen);
router.post("/deleteMessage", userController.deleteNotifications);

// Static / Informational Pages
router.get("/privacyPolicy", userController.getPrivacyPolicy);
router.get("/termsAndCondition", userController.getTermsAndCondition);
router.get("/faq", userController.getFaq);
router.get("/error", userController.getError);

module.exports = router;
