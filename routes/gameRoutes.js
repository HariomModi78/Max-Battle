const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// Spin & Wheel Game
router.get("/spin/:userId", gameController.getSpin);
router.get("/spinResult/:userId", gameController.getSpinResult);

// Lucky Draw / Lottery
router.get("/luckyDraw/:userId/:status", gameController.getLuckyDraw);
router.get("/luckyDrawPayment/:luckyDrawId/:userId", gameController.getLuckyDrawPayment);
router.post("/luckyDrawPayment/:luckyDrawId/:userId", gameController.postLuckyDrawPayment);

// Admin Lucky Draw Controls
router.get("/adminCreateLuckyDraw/:adminId", gameController.getAdminCreateLuckyDraw);
router.post("/adminCreateLuckyDraw/:adminId", gameController.postAdminCreateLuckyDraw);

// System broadcast (emergency)
router.get("/allSend", gameController.allSend);

module.exports = router;
