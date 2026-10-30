const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");

// User Tournament Views
router.get("/myupcoming/:userId", tournamentController.getMyUpcoming);
router.get("/myOngoing/:userId", tournamentController.getMyOngoing);
router.get("/myCompleted/:userId", tournamentController.getMyCompleted);

// Tournament Listings by Mode & Type
router.get("/tournament/result/:modeType/:matchType/:variable/:userId", tournamentController.getResultTournaments);
router.get("/tournament/upcoming/:modeType/:matchType/:variable/:userId", tournamentController.getUpcomingTournaments);
router.get("/tournament/ongoing/:modeType/:matchType/:variable/:userId", tournamentController.getOngoingTournaments);

// Tournament Details & Booking
router.get("/tournament/detail/:userId/:tournamentId", tournamentController.getTournamentDetail);
router.get("/tournament/slot/:userId/:tournamentId", tournamentController.getTournamentSlot);
router.get("/tournament/payment/:userId/:tournamentId/:slotNumber", tournamentController.getTournamentPayment);
router.post("/roomIdAndPassword/:userId/:tournamentId/:slotNumber", tournamentController.bookSlotAndDeductBalance);

// Leaderboard & Participants
router.get("/tournamentLeadboard/:tournamentId", tournamentController.getTournamentLeaderboard);
router.get("/tournamentLeadboard/cs/:tournamentId", tournamentController.getTournamentLeaderboardCS);
router.get("/tournamentUsers/:tournamentId", tournamentController.getTournamentUsers);

module.exports = router;
