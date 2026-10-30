const mongoose = require("mongoose");
const userDataBase = require("../models/userModel");
const tournamentDataBase = require("../models/tournamentModel");
const tournamentLeadboardDataBase = require("../models/tournamentLeadboard");
const soloDataBase = require("../models/soloModel");
const duoDataBase = require("../models/duoModel");
const squadDataBase = require("../models/squadModel");
const notificationDataBase = require("../models/notification");
const emailService = require("../services/emailService");

const tournamentController = {
  // GET /myupcoming/:userId
  getMyUpcoming: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const tournament = await tournamentDataBase.find({ status: "upcoming" });
      res.render("myUpcoming", { user, tournament });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /myOngoing/:userId
  getMyOngoing: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const tournament = await tournamentDataBase.find({ status: "ongoing" });
      res.render("myOngoing", { user, tournament });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /myCompleted/:userId
  getMyCompleted: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const tournament = await tournamentDataBase.find({ status: "completed" });
      res.render("myCompleted", { user, tournament });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournament/result/:modeType/:matchType/:variable/:userId
  getResultTournaments: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      let tournament;
      if (req.params.variable === "free") {
        tournament = await tournamentDataBase.find({ status: "completed", entryFee: 0 }).sort({ dateAndTime: -1 });
      } else if (req.params.variable === "1rs") {
        tournament = await tournamentDataBase
          .find({ modeType: req.params.modeType, matchType: req.params.matchType, status: "completed", entryFee: 1 })
          .sort({ dateAndTime: -1 });
      } else {
        tournament = await tournamentDataBase
          .find({ modeType: req.params.modeType, matchType: req.params.matchType, status: "completed", entryFee: { $nin: [0, 1] } })
          .sort({ dateAndTime: -1 });
      }
      res.render("result", {
        user,
        tournament,
        modeType: req.params.modeType,
        matchType: req.params.matchType,
        variable: req.params.variable,
      });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournament/upcoming/:modeType/:matchType/:variable/:userId
  getUpcomingTournaments: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      let tournament;
      if (req.params.variable === "free") {
        tournament = await tournamentDataBase.find({ status: "upcoming", entryFee: 0 }).sort({ dateAndTime: 1 });
      } else if (req.params.variable === "1rs") {
        tournament = await tournamentDataBase.find({ status: "upcoming", entryFee: 1 }).sort({ dateAndTime: 1 });
      } else {
        tournament = await tournamentDataBase
          .find({ modeType: req.params.modeType, matchType: req.params.matchType, status: "upcoming", entryFee: { $nin: [0, 1] } })
          .sort({ dateAndTime: 1 });
      }
      res.render("upcoming", {
        user,
        tournament,
        modeType: req.params.modeType,
        matchType: req.params.matchType,
        variable: req.params.variable,
      });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournament/ongoing/:modeType/:matchType/:variable/:userId
  getOngoingTournaments: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      let tournament;
      if (req.params.variable === "free") {
        tournament = await tournamentDataBase.find({ status: "ongoing", entryFee: 0 }).sort({ dateAndTime: 1 });
      } else if (req.params.variable === "1rs") {
        tournament = await tournamentDataBase
          .find({ modeType: req.params.modeType, matchType: req.params.matchType, status: "ongoing", entryFee: 1 })
          .sort({ dateAndTime: 1 });
      } else {
        tournament = await tournamentDataBase
          .find({ modeType: req.params.modeType, matchType: req.params.matchType, status: "ongoing", entryFee: { $nin: [0, 1] } })
          .sort({ dateAndTime: 1 });
      }
      res.render("ongoing", {
        user,
        tournament,
        modeType: req.params.modeType,
        matchType: req.params.matchType,
        variable: req.params.variable,
      });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournament/slot/:userId/:tournamentId
  getTournamentSlot: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const tournamentTemp = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      const matchType = tournamentTemp.matchType;
      let bookedSlots;
      let slots = [];

      if (matchType === "solo") {
        bookedSlots = await soloDataBase.find({ tournamentId: tournamentTemp._id });
        slots = bookedSlots.map((slot) => slot.slotNumber);
      } else if (matchType === "duo") {
        bookedSlots = await duoDataBase.find({ tournamentId: tournamentTemp._id });
        slots = bookedSlots.map((slot) => slot.slotId);
      } else if (matchType === "squad") {
        bookedSlots = await squadDataBase.find({ tournamentId: tournamentTemp._id });
        slots = bookedSlots.map((slot) => slot.slotId);
      }

      res.render("slot", { user, slots, matchType, tournamentTemp });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournament/payment/:userId/:tournamentId/:slotNumber
  getTournamentPayment: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      const slotNumber = req.params.slotNumber;
      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();

      let slot;
      if (tournament.matchType === "solo") {
        slot = await soloDataBase.findOne({ tournamentId: tournament._id, slotNumber: req.params.slotNumber }).lean();
      } else if (tournament.matchType === "duo") {
        slot = await duoDataBase.findOne({ tournamentId: tournament._id, slotId: req.params.slotNumber }).lean();
      } else if (tournament.matchType === "squad") {
        slot = await squadDataBase.findOne({ tournamentId: tournament._id, slotId: req.params.slotNumber }).lean();
      }

      if (slot) {
        return res.redirect(`/tournament/detail/${req.params.userId}/${req.params.tournamentId}`);
      }

      let alreadyJoined;
      if (tournament.matchType === "solo") {
        alreadyJoined = await soloDataBase.findOne({ tournamentId: tournament._id, userId: user._id }).lean();
      } else if (tournament.matchType === "duo") {
        alreadyJoined = await duoDataBase.findOne({ tournamentId: tournament._id, userId: user._id }).lean();
      } else if (tournament.matchType === "squad") {
        alreadyJoined = await squadDataBase.findOne({ tournamentId: tournament._id, userId: user._id }).lean();
      }

      if (alreadyJoined) {
        return res.redirect("/");
      }

      res.render("tournamentPayment", { user, tournament, slotNumber, luckyDrawFlag: false });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournamentLeadboard/:tournamentId
  getTournamentLeaderboard: async (req, res) => {
    try {
      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      const tournamentLeadboard = await tournamentLeadboardDataBase
        .findOne({ tournamentId: req.params.tournamentId })
        .populate("player.userId");
      const players = (tournamentLeadboard?.player || []).sort((a, b) => b.kills - a.kills);
      res.render("tournamentLeadboard", { players, tournament });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournamentLeadboard/cs/:tournamentId
  getTournamentLeaderboardCS: async (req, res) => {
    try {
      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      let users;
      if (tournament.matchType === "solo") {
        users = await soloDataBase.find({ tournamentId: tournament._id }).sort({ slotId: -1 });
      } else if (tournament.matchType === "duo") {
        users = await duoDataBase.find({ tournamentId: tournament._id }).lean();
      } else if (tournament.matchType === "squad") {
        users = await squadDataBase.find({ tournamentId: tournament._id }).lean();
      }

      const tournamentLeadboard = await tournamentLeadboardDataBase
        .findOne({ tournamentId: req.params.tournamentId })
        .lean();
      let players = tournamentLeadboard?.player || [];
      players = players.map((player) => String(player.userId));

      const team1 = users.filter((u) => u.teamId === "team1");
      const team2 = users.filter((u) => u.teamId === "team2");

      res.render("tournamentLeadboard", { players, tournament, users, team1, team2 });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournament/detail/:userId/:tournamentId
  getTournamentDetail: async (req, res) => {
    try {
      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      const user = await userDataBase.findOne({ _id: req.params.userId }).lean();
      let joined;

      if (tournament.matchType === "solo") {
        joined = await soloDataBase.findOne({ tournamentId: tournament._id, userId: req.params.userId }).lean();
      } else if (tournament.matchType === "duo") {
        joined = await duoDataBase.findOne({ tournamentId: tournament._id, userId: req.params.userId });
      } else if (tournament.matchType === "squad") {
        joined = await squadDataBase.findOne({ tournamentId: tournament._id, userId: req.params.userId }).lean();
      }

      let users;
      if (tournament.matchType === "solo") {
        users = await soloDataBase.find({ tournamentId: tournament._id }).sort({ slotNumber: 1 });
      } else if (tournament.matchType === "duo") {
        users = await duoDataBase.find({ tournamentId: tournament._id }).lean().sort({ slotId: 1 });
      } else if (tournament.matchType === "squad") {
        users = await squadDataBase.find({ tournamentId: tournament._id }).lean().sort({ slotId: 1 });
      }

      if (tournament.modeType === "cs") {
        const team1 = users.filter((u) => u.teamId === "team1");
        const team2 = users.filter((u) => u.teamId === "team2");
        res.render("tournamentDetail", { tournament, user, joined, team1, team2, users });
      } else {
        res.render("tournamentDetail", { tournament, user, joined, users });
      }
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /tournamentUsers/:tournamentId
  getTournamentUsers: async (req, res) => {
    try {
      const users = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).populate("slots");
      res.json(users);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /roomIdAndPassword/:userId/:tournamentId/:slotNumber
  bookSlotAndDeductBalance: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await userDataBase.findOne({ _id: req.params.userId }).session(session);
      const slotNumber = req.params.slotNumber;
      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).session(session);

      let slot;
      if (tournament.matchType === "solo") {
        slot = await soloDataBase.findOne({ tournamentId: tournament._id, slotNumber: req.params.slotNumber }).session(session);
      } else if (tournament.matchType === "duo") {
        slot = await duoDataBase.findOne({ tournamentId: tournament._id, slotId: req.params.slotNumber }).session(session);
      } else if (tournament.matchType === "squad") {
        slot = await squadDataBase.findOne({ tournamentId: tournament._id, slotId: req.params.slotNumber }).session(session);
      }

      if (slot) {
        await session.abortTransaction();
        session.endSession();
        return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
      }

      let alreadyJoined;
      if (tournament.matchType === "solo") {
        alreadyJoined = await soloDataBase.findOne({ tournamentId: tournament._id, userId: user._id }).session(session);
      } else if (tournament.matchType === "duo") {
        alreadyJoined = await duoDataBase.findOne({ tournamentId: tournament._id, userId: user._id }).session(session);
      } else if (tournament.matchType === "squad") {
        alreadyJoined = await squadDataBase.findOne({ tournamentId: tournament._id, userId: user._id }).session(session);
      }

      if (alreadyJoined) {
        await session.abortTransaction();
        session.endSession();
        return res.redirect("/");
      }

      if (user.totalBalance >= tournament.entryFee) {
        const entryFee = tournament.entryFee;
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

        const updatedTournament = await tournamentDataBase.findOneAndUpdate(
          { _id: req.params.tournamentId },
          {
            $inc: { slotsFilled: 1 },
            $push: { slots: req.params.userId },
          },
          { session }
        );

        if (!updatedTournament) {
          await session.abortTransaction();
          session.endSession();
          return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
        }

        if (tournament.matchType === "solo") {
          await soloDataBase.create(
            [{
              tournamentId: tournament._id,
              userId: user._id,
              slotNumber: req.params.slotNumber,
              gameName: user.gameName,
            }],
            { session }
          );
        } else if (tournament.matchType === "duo") {
          await duoDataBase.create(
            [{
              tournamentId: tournament._id,
              userId: user._id,
              slotId: req.params.slotNumber,
              teamId: "team" + req.params.slotNumber.slice(0, -1),
              gameName: user.gameName,
            }],
            { session }
          );
        } else if (tournament.matchType === "squad") {
          await squadDataBase.create(
            [{
              tournamentId: tournament._id,
              userId: user._id,
              slotId: req.params.slotNumber,
              teamId: "team" + req.params.slotNumber.slice(0, -1),
              gameName: user.gameName,
            }],
            { session }
          );
        }

        await userDataBase.findOneAndUpdate(
          { _id: user._id },
          {
            $inc: {
              totalBalance: -tournament.entryFee,
              deposited: -depositedToDeduct,
              winning: -winningToDeduct,
              bonus: -bonusToDeduct,
              totalMatch: 1,
            },
          },
          { session }
        );

        await notificationDataBase.create(
          [{
            title: "Tournament succesfully joined",
            message: `👋 Hi ${user.username}, your slot number is ${req.params.slotNumber} for "${tournament.description}". Be in the room before time ⏰. ❌ You’ll be responsible.`,
            userId: user._id,
          }],
          { session }
        );

        // Notify all users when slots reach 50% or only 1 left
        if (Number(tournament.slotsFilled) + 1 === Number(tournament.totalSlots / 2)) {
          const eligibleUsers = await userDataBase.find({ emailPermission: true }).lean();
          for (let i = 0; i < eligibleUsers.length; i++) {
            emailService.sendAll(
              eligibleUsers[i].email,
              "Max Battle🏆",
              `<div style="padding: 20px; background: linear-gradient(90deg, #fceabb, #f8b500); border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #333; font-size: 16px; text-align: center;">
                <strong style="font-size: 18px;">🚨 50% Slots Booked!</strong><br>
                The tournament is filling up fast. <strong>Join now</strong> to confirm your slot before it's full!
              </div>`
            );
          }
        }

        if (Number(tournament.slotsFilled) + 1 === Number(tournament.totalSlots - 1)) {
          const eligibleUsers = await userDataBase.find({ emailPermission: true }).lean();
          for (let i = 0; i < eligibleUsers.length; i++) {
            emailService.sendAll(
              eligibleUsers[i].email,
              "Max Battle🏆",
              `<div style="padding: 20px; background: linear-gradient(90deg, #fceabb, #f8b500); border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #333; font-size: 16px; text-align: center;">
                <strong style="font-size: 18px;">🚨 Only 1 slot left!</strong><br>
                The tournament is filling up fast. <strong>Join now</strong> to confirm your slot before it's full!
              </div>`
            );
          }
        }

        // Referral reward check
        if (user.referredBy && !user.isReferred && tournament.entryFee > 0) {
          await userDataBase.findOneAndUpdate({ _id: user._id }, { isReferred: true }, { session });
          const friend = await userDataBase.findOneAndUpdate(
            { _id: user.referredBy },
            {
              $inc: { earning: 5, totalBalance: 5, bonus: 5 },
            },
            { session }
          );
          if (friend) {
            await notificationDataBase.create(
              [{
                title: "Refer completed✅",
                message: `Hi ${friend.username}, you earn 5 Max Coins as your referral bonus you can play matches from these coins`,
                userId: user.referredBy,
              }],
              { session }
            );
          }
        }

        await session.commitTransaction();
        session.endSession();
        res.cookie("id", req.params.tournamentId);
        return res.redirect(`/tournament/detail/${req.params.userId}/${req.params.tournamentId}`);
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
      }
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      return res.redirect("/");
    }
  },
};

module.exports = tournamentController;
