const mongoose = require("mongoose");
const userDataBase = require("../models/userModel");
const tournamentDataBase = require("../models/tournamentModel");
const luckyDrawDataBase = require("../models/luckyDrawModel");
const notificationDataBase = require("../models/notification");
const ticketDataBase = require("../models/ticketModel");
const emailService = require("../services/emailService");
const { isAdmin } = require("../middlewares/authMiddleware");

const gameController = {
  // GET /spin/:userId
  getSpin: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (!user) return res.redirect("/error");

      const now = new Date();
      const lastSpin = new Date(user.lastSpinTime || 0);
      const hoursSinceLastSpin = (now - lastSpin) / (1000 * 60 * 60);
      let timeLeft = false;

      if (hoursSinceLastSpin < 5) {
        const remaining = (5 - hoursSinceLastSpin).toFixed(2);
        timeLeft = remaining * 60 * 60 * 1000;
      }

      res.render("spin", { user, timeLeft });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /spinResult/:userId
  getSpinResult: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId });
      if (!user) return res.json(false);

      const now = new Date();
      const lastSpin = new Date(user.lastSpinTime || 0);
      const hoursSinceLastSpin = (now - lastSpin) / (1000 * 60 * 60);

      if (hoursSinceLastSpin > 5) {
        const num = Math.floor(Math.pow(Math.random(), 2) * 6);
        let reward = 0;

        if (num === 0) reward = 0.3;
        else if (num === 2) reward = 0.2;
        else if (num === 4) reward = 0.1;
        else if (num === 5) reward = 1.0;

        if (reward > 0) {
          await userDataBase.findOneAndUpdate(
            { _id: user._id },
            {
              $inc: { totalBalance: reward, bonus: reward },
              $set: { lastSpinTime: new Date() },
            }
          );
        } else {
          await userDataBase.findOneAndUpdate(
            { _id: user._id },
            { $set: { lastSpinTime: new Date() } }
          );
        }

        return res.json({ num });
      } else {
        return res.json(false);
      }
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /allSend
  allSend: async (req, res) => {
    try {
      const users = await userDataBase.find().lean();
      for (let i = 0; i < users.length; i++) {
        await notificationDataBase.create({
          title: "⚠️⚠️No more⚠️⚠️",
          message: `Hi ${users[i].username}, due to some problem I am unable to run this app so you can withdraw your remaining cash and please do not add cash🚨`,
          userId: users[i]._id,
        });

        emailService.sendAll(
          users[i].email,
          "MAX BATTLE🏆",
          `<div style="font-family: Arial, sans-serif; background:#fff3cd; color:#856404; padding:18px; border-radius:8px; border:1px solid #ffeeba; max-width:600px; margin:0 auto;">
            <h2 style="margin:0 0 10px 0;">📢 Important Update</h2>
            <p style="margin:0 0 10px 0;">
              Dear ${users[i].username},<br>
              Due to some issues, I am currently unable to run the app. You can withdraw your winning amount without any problem.
            </p>
            <p style="margin:0;">Thank you for your understanding and support.</p>
          </div>`
        );
      }
      await tournamentDataBase.deleteMany();
      res.send("Done");
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /luckyDraw/:userId/:status
  getLuckyDraw: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      if (!user) return res.redirect("/error");

      let luckyDraw;
      if (req.params.status === "ongoing") {
        luckyDraw = await luckyDrawDataBase.find({ status: "ongoing" }).lean();
      } else {
        luckyDraw = await luckyDrawDataBase.find({ status: "result" }).lean();
      }

      res.render("luckyDraw", { luckyDraw, user });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /adminCreateLuckyDraw/:adminId
  getAdminCreateLuckyDraw: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) return res.redirect("/");
      res.render("adminCreateLuckyDraw", { admin });
    } catch (e) {
      res.send("error");
    }
  },

  // POST /adminCreateLuckyDraw/:adminId
  postAdminCreateLuckyDraw: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) return res.redirect("/");

      const { description, drawDateAndTime, price, prizePool, totalSlots } = req.body;
      await luckyDrawDataBase.create({
        description,
        drawDateAndTime,
        price,
        prizePool,
        totalSlots,
      });

      res.send("Done ✅");
    } catch (e) {
      res.send("error");
    }
  },

  // GET /luckyDrawPayment/:luckyDrawId/:userId
  getLuckyDrawPayment: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const luckyDraw = await luckyDrawDataBase.findOne({ _id: req.params.luckyDrawId }).lean();
      if (user) {
        res.render("tournamentPayment", { luckyDrawFlag: true, user, luckyDraw });
      } else {
        res.redirect("/error");
      }
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /luckyDrawPayment/:luckyDrawId/:userId
  postLuckyDrawPayment: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).session(session);
      const luckyDraw = await luckyDrawDataBase.findOne({ _id: req.params.luckyDrawId }).session(session);

      if (user && luckyDraw && user.totalBalance >= luckyDraw.price) {
        const entryFee = luckyDraw.price;
        let depositedToDeduct = 0;
        let winningToDeduct = 0;
        let bonusToDeduct = 0;
        let remaining = 0;

        if (user.deposited >= entryFee) {
          depositedToDeduct = entryFee;
        } else {
          depositedToDeduct = user.deposited;
          remaining = entryFee - depositedToDeduct;
        }

        if (user.winning >= remaining) {
          winningToDeduct = remaining;
        } else {
          winningToDeduct = user.winning;
          remaining -= winningToDeduct;
        }

        if (user.bonus >= remaining) {
          bonusToDeduct = remaining;
        }

        const updatedLuckyDraw = await luckyDrawDataBase.findOneAndUpdate(
          { _id: req.params.luckyDrawId },
          {
            $inc: { slotsFilled: 1 },
            $push: { slots: req.params.userId },
          },
          { session }
        );

        if (!updatedLuckyDraw) {
          await session.abortTransaction();
          session.endSession();
          return res.redirect(`/luckyDraw/${req.params.luckyDrawId}/${req.params.userId}`);
        }

        await ticketDataBase.create(
          [{
            luckyDrawId: req.params.luckyDrawId,
            userId: req.params.userId,
            ticketNumber: updatedLuckyDraw.slots.length + 1,
          }],
          { session }
        );

        await userDataBase.findOneAndUpdate(
          { _id: user._id },
          {
            $inc: {
              totalBalance: -luckyDraw.price,
              deposited: -depositedToDeduct,
              winning: -winningToDeduct,
              bonus: -bonusToDeduct,
            },
          },
          { session }
        );

        await notificationDataBase.create(
          [{
            title: "Ticket succesfully confirmed",
            message: `👋 Hi ${user.username}, your ticket is confirmed and its number is ${updatedLuckyDraw.slots.length + 1}`,
            userId: user._id,
          }],
          { session }
        );

        await session.commitTransaction();
        session.endSession();
        res.redirect(`/luckyDraw/${req.params.userId}/ongoing`);
      } else {
        await session.abortTransaction();
        session.endSession();
        res.redirect(`/luckyDraw/${req.params.userId}/ongoing`);
      }
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      res.redirect("/error");
    }
  },
};

module.exports = gameController;
