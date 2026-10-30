const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin Panel Overview
router.get("/adminPanel/:adminId", adminController.getAdminPanel);
router.get("/adminTotalUser/:adminId", adminController.getTotalUsers);

// Withdraw Approval & Requests
router.get("/pendingWithdrawRequest/:adminId", adminController.getPendingWithdrawRequests);
router.post("/adminApproveWithdraw/:adminId/:transactionId", adminController.postApproveWithdraw);

// Tournament Management
router.get("/adminCreateTournament/:adminId", adminController.getCreateTournament);
router.post("/adminCreateTournament/:adminId", adminController.postCreateTournament);
router.post("/admin/automaticCreateTournament/:adminId", adminController.postAutomaticCreateTournament);
router.get("/admin/tournament/:status/:adminId", adminController.getAdminTournaments);
router.get("/adminEditTournament/:adminId/:tournamentId", adminController.getEditTournament);
router.post("/adminEditTournament/:adminId/:tournamentId", adminController.postEditTournament);
router.post("/tournament/setOngoing/:tournamentId/:adminId", adminController.postSetOngoing);
router.post("/adminSendRoomDetails/:adminId/:tournamentId", adminController.postSendRoomDetails);

// Prize Distribution & Refunds
router.get("/adminPrizeDistribute/:adminId/:tournamentId", adminController.getPrizeDistribute);
router.post("/adminPrizeDistribution/:adminId/:tournamentId", adminController.postPrizeDistribution);
router.post("/adminPrizeDistribution/cs/:adminId/:tournamentId", adminController.postPrizeDistributionCS);
router.post("/adminRefund/:adminId/:tournamentId", adminController.postRefundTournament);

// Monthly Leaderboard Rewards
router.get("/monthlyPrizeDistribution/verification/:adminId", adminController.getMonthlyPrizeVerification);
router.post("/monthlyPrizeDistribution/:adminId", adminController.postMonthlyPrizeDistribution);

// Mass Email Announcements
router.get("/adminSendEmail/:adminId", adminController.getAdminSendEmail);
router.post("/adminSendEmail/:adminId", adminController.postAdminSendEmail);

module.exports = router;
