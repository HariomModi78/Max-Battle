const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const userDataBase = require("../models/userModel");
const tournamentDataBase = require("../models/tournamentModel");
const notificationDataBase = require("../models/notification");
const luckyDrawDataBase = require("../models/luckyDrawModel");
const emailService = require("../services/emailService");

const userController = {
  // GET /home/:userId
  getHome: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (!user) return res.redirect("/error");

      const notification = await notificationDataBase.find({ userId: req.params.userId, seen: false }).lean();
      const ad = req.cookies.ad;
      const adFlag = ad === "ad";

      const tournament = {
        free: await tournamentDataBase.find({ status: "upcoming", entryFee: 0 }),
        oneRs: await tournamentDataBase.find({ status: "upcoming", entryFee: 1 }),
        csSolo: await tournamentDataBase.find({ matchType: "solo", modeType: "cs", status: "upcoming", entryFee: { $nin: [0, 1] } }),
        csDuo: await tournamentDataBase.find({ matchType: "duo", modeType: "cs", status: "upcoming", entryFee: { $nin: [0, 1] } }),
        csSquad: await tournamentDataBase.find({ matchType: "squad", modeType: "cs", status: "upcoming", entryFee: { $nin: [0, 1] } }),
        perKill: await tournamentDataBase.find({ modeType: "fullmap", status: "upcoming", entryFee: { $nin: [0, 1] } }),
      };

      const luckyDraw = await luckyDrawDataBase.find({ status: "ongoing" });
      res.render("home", {
        user,
        notification: notification.length,
        adFlag,
        tournament,
        luckyDraw,
      });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /profile/:userId
  getProfile: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (!user) return res.redirect("/error");

      const notification = await notificationDataBase.find({ userId: req.params.userId, seen: false }).lean();
      res.render("profile", { user, notification: notification.length });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /editProfile/:userId
  getEditProfile: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (!user) return res.redirect("/error");
      res.render("editProfile", { user });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /changeDetail/:userId
  postChangeDetail: async (req, res) => {
    try {
      await userDataBase.findOneAndUpdate(
        { _id: req.params.userId },
        {
          gameName: req.body.gameName,
          gameId: req.body.gameId,
        }
      );
      res.redirect(`/editProfile/${req.params.userId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /resetPassword/:userId
  postResetPassword: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (!user) return res.redirect("/error");

      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.newPassword, salt);
        await userDataBase.findOneAndUpdate({ _id: req.params.userId }, { password: hash });
        return res.send("Password is successfuly changed");
      } else {
        return res.send("Old Password is incorrect");
      }
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /leadboard/:userId
  getLeaderboard: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const users = await userDataBase.find().sort({ monthlyWinning: -1 }).lean();
      const notification = await notificationDataBase.find({ userId: req.params.userId, seen: false }).lean();
      res.render("leadboard", { user, users, notification: notification.length });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /referAndEarn/:userId
  getReferAndEarn: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId });
      const referrals = await userDataBase.find({ referredBy: user._id });
      res.render("referAndEarn", { user, referrals });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /emailPermission/:userId
  postEmailPermission: async (req, res) => {
    try {
      const flag = Boolean(req.body.emailPermission);
      await userDataBase.findOneAndUpdate({ _id: req.params.userId }, { emailPermission: flag });
      res.send("Done");
    } catch (e) {
      res.status(500).send("Error updating email permission");
    }
  },

  // POST /userUpi/:userId
  postUserUpi: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId });
      const alreadyExists = await userDataBase.findOne({ upi: req.body.upi });

      if (user && user.upi.length === 0 && !alreadyExists) {
        await userDataBase.findOneAndUpdate(
          { _id: user._id },
          { $push: { upi: req.body.upi } }
        );

        const admins = await userDataBase.find({ role: "admin" });
        for (let i = 0; i < admins.length; i++) {
          await notificationDataBase.create({
            title: "User bind ther upi",
            message: `${user.username}, with ${req.body.upi} on MAX BATTLE`,
            userId: admins[i]._id,
          });
          await emailService.sendAll(
            admins[i].email,
            "🎉🎉User Bind there UPI",
            `<p><strong>Action Required:</strong></p><p>User <strong>${user.username}</strong> has successfully bound their UPI ID <strong>${req.body.upi}</strong>. Please send <strong>₹1</strong> to their account now.</p>`
          );
        }
        return res.json(true);
      } else {
        return res.json(false);
      }
    } catch (e) {
      res.status(500).json(false);
    }
  },

  // GET /confirmBonus/:userId
  getConfirmBonus: async (req, res) => {
    try {
      await userDataBase.findOneAndUpdate({ _id: req.params.userId }, { isApplyCode: false });
      res.json({ done: "done" });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  },

  // GET /notification/:userId
  getNotifications: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const notification = await notificationDataBase.find({ userId: req.params.userId }).lean();
      res.render("notification", { user, notification });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /seenTrue
  markNotificationSeen: async (req, res) => {
    try {
      const notificationId = new mongoose.Types.ObjectId(req.body.notificationId);
      await notificationDataBase.findOneAndUpdate({ _id: notificationId }, { seen: true });
      res.json({ message: "✅ Marked as seen" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  },

  // POST /deleteMessage
  deleteNotifications: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.body.userId);
      await notificationDataBase.deleteMany({ userId: userId, seen: true });
      res.json({ message: "✅ Marked as seen" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  },

  // Static informational pages
  getPrivacyPolicy: (req, res) => res.render("privacyPolicy"),
  getTermsAndCondition: (req, res) => res.render("termsAndCondition"),
  getFaq: (req, res) => res.render("faq"),
  getError: (req, res) => res.render("error"),
  getPing: (req, res) => res.status(200).send("pong"),
};

module.exports = userController;
