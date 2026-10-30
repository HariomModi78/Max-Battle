const jwt = require("jsonwebtoken");
const userDataBase = require("../models/userModel");
const tournamentDataBase = require("../models/tournamentModel");
const tournamentLeadboardDataBase = require("../models/tournamentLeadboard");
const transactionDataBase = require("../models/transactionModel");
const soloDataBase = require("../models/soloModel");
const duoDataBase = require("../models/duoModel");
const squadDataBase = require("../models/squadModel");
const notificationDataBase = require("../models/notification");
const emailService = require("../services/emailService");
const { isAdmin } = require("../middlewares/authMiddleware");

const adminController = {
  // GET /adminPanel/:adminId
  getAdminPanel: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const user = await userDataBase.find().lean();
      const tournament = await tournamentDataBase.find().lean();
      const upcomingTournament = await tournamentDataBase.find({ status: "upcoming" }).lean();
      const withdraw = await transactionDataBase.find({ status: "withdraw", flag: false }).lean();
      const ongoing = tournament.filter((val) => val.status === "ongoing");
      const transaction = await transactionDataBase.find({ upiId: null }).lean();

      res.render("adminPanel", {
        user,
        tournament: tournament.length,
        ongoing: ongoing.length,
        admin,
        upcomingTournament: upcomingTournament.length,
        withdraw: withdraw.length,
        transaction,
      });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /pendingWithdrawRequest/:adminId
  getPendingWithdrawRequests: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) return res.redirect("/");

      const withdraw = await transactionDataBase.find({ status: "withdraw", flag: false }).populate("userId");
      res.render("withdrawRequest", { withdraw, admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminApproveWithdraw/:adminId/:transactionId
  postApproveWithdraw: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const transaction = await transactionDataBase.findOneAndUpdate(
        { _id: req.params.transactionId },
        { flag: true },
        { new: true }
      );

      await notificationDataBase.create({
        title: "withdraw Completed✅",
        message: `🚀 ₹${transaction.amount} sent successfully! Withdrawal processed — check your account. 👍`,
        userId: transaction.userId,
      });

      const user = await userDataBase.findOne({ _id: transaction.userId });
      if (user?.email && user.emailPermission) {
        emailService.sendSuccess(user.email, "Withdraw Successful", transaction.amount);
      }

      res.redirect(`/pendingWithdrawRequest/${req.params.adminId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminSendRoomDetails/:adminId/:tournamentId
  postSendRoomDetails: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const tournament = await tournamentDataBase.findOneAndUpdate(
        { _id: req.params.tournamentId },
        {
          roomId: req.body.roomId,
          roomPassword: req.body.roomPassword,
        },
        { new: true }
      );

      let slotUsers = tournament.slots.filter((val) => val != null);
      const users = await userDataBase.find({ _id: { $in: slotUsers } });

      for (let i = 0; i < users.length; i++) {
        if (users[i].emailPermission) {
          emailService.sendIdPass(
            users[i].email,
            "Max battle Room Id and Password",
            req.body.roomId,
            req.body.roomPassword
          );
        }
        await notificationDataBase.create({
          title: "Room id & pass😊",
          message: `👋Hi ${users[i].username}, your room id is ${req.body.roomId} and password is ${req.body.roomPassword} for ${tournament.description} join fast⏩`,
          userId: users[i]._id,
        });
      }

      res.redirect(`/adminEditTournament/${req.params.adminId}/${req.params.tournamentId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /adminTotalUser/:adminId
  getTotalUsers: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }
      const users = await userDataBase.find().lean();
      res.render("adminTotalUser", { users, admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /adminCreateTournament/:adminId
  getCreateTournament: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }
      res.render("adminCreateTournament", { admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminCreateTournament/:adminId
  postCreateTournament: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const date = new Date(req.body.dateAndTime);
      await tournamentDataBase.create({
        description: req.body.description,
        dateAndTime: date,
        entryFee: req.body.entryFee,
        perKillAmount: req.body.perKillAmount,
        prizePool: req.body.prizePool,
        matchType: req.body.matchType,
        totalSlots: req.body.totalSlots,
        map: req.body.map,
        firstPrize: req.body.firstPrize,
        secondPrize: req.body.secondPrize,
        modeType: req.body.modeType,
        slots: Array(Number(req.body.totalSlots)).fill(null),
      });

      res.redirect(`/adminCreateTournament/${admin._id}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /admin/automaticCreateTournament/:adminId
  postAutomaticCreateTournament: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const oldTournament = await tournamentDataBase.findOne({ status: "upcoming" });
      if (oldTournament) {
        return res.send("Please kal ke din try karna❌");
      }

      const now = new Date();
      for (let i = 0; i < 8; i++) {
        const date = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 14, 0 + i * 30, 0)
        );

        let tournamentConfig = {};
        if (i < 2) {
          tournamentConfig = {
            description: "CLASH SQUAD 4v4 (FREE 🎁)",
            entryFee: 0,
            prizePool: 16,
            perKillAmount: 0,
            totalSlots: 8,
            matchType: "squad",
            modeType: "cs",
            firstPrize: 0,
            secondPrize: 0,
            dateAndTime: date,
            map: "Bermunda",
          };
        } else if (i < 4) {
          tournamentConfig = {
            description: "CLASH SQUAD 2V2 (FREE 🎁)",
            entryFee: 0,
            prizePool: 8,
            perKillAmount: 0,
            totalSlots: 4,
            matchType: "duo",
            modeType: "cs",
            firstPrize: 0,
            secondPrize: 0,
            dateAndTime: date,
            map: "Bermunda",
          };
        } else if (i < 6) {
          tournamentConfig = {
            description: "CLASH SQUAD 1V1 ",
            entryFee: 5,
            prizePool: 10,
            perKillAmount: 0,
            totalSlots: 2,
            matchType: "solo",
            modeType: "cs",
            firstPrize: 0,
            secondPrize: 0,
            dateAndTime: date,
            map: "Bermunda",
          };
        } else {
          tournamentConfig = {
            description: "CLASH SQUAD 2V2 ",
            entryFee: 5,
            prizePool: 20,
            perKillAmount: 0,
            totalSlots: 4,
            matchType: "duo",
            modeType: "cs",
            firstPrize: 0,
            secondPrize: 0,
            dateAndTime: date,
            map: "Bermunda",
          };
        }
        await tournamentDataBase.create(tournamentConfig);
      }

      const users = await userDataBase.find().lean();
      for (let i = 0; i < users.length; i++) {
        if (users[i].emailPermission) {
          emailService.sendAlert(users[i].email, "🎮 Good Morning! New Tournaments are Live on Max Battle");
        }
      }

      res.send("All tournament are successful created✅");
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /admin/tournament/:status/:adminId
  getAdminTournaments: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      let tournament;
      if (req.params.status === "total") {
        tournament = await tournamentDataBase.find().sort({ dateAndTime: 1 });
      } else if (req.params.status === "upcoming") {
        tournament = await tournamentDataBase.find({ status: "upcoming" }).sort({ dateAndTime: 1 });
      } else if (req.params.status === "ongoing") {
        tournament = await tournamentDataBase.find({ status: "ongoing" }).sort({ dateAndTime: 1 });
      }

      res.render("adminTotalTournament", { tournament, admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /adminEditTournament/:adminId/:tournamentId
  getEditTournament: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      res.render("adminEditTournament", { tournament, admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminEditTournament/:adminId/:tournamentId
  postEditTournament: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      if (req.body.delete) {
        await tournamentDataBase.findOneAndDelete({ _id: req.params.tournamentId });
        await tournamentLeadboardDataBase.findOneAndDelete({ tournamentId: req.params.tournamentId });
      } else {
        await tournamentDataBase.findOneAndUpdate(
          { _id: req.params.tournamentId },
          {
            description: req.body.description,
            dateAndTime: req.body.dateAndTime,
            entryFee: req.body.entryFee,
            perKillAmount: req.body.perKillAmount,
            prizePool: req.body.prizePool,
            matchType: req.body.matchType,
            totalSlots: req.body.totalSlots,
            map: req.body.map,
            firstPrize: req.body.firstPrize,
            secondPrize: req.body.secondPrize,
            modeType: req.body.modeType,
          }
        );
      }

      res.redirect(`/adminPanel/${admin._id}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /adminPrizeDistribute/:adminId/:tournamentId
  getPrizeDistribute: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).sort({ dateAndTime: 1 });
      let user;

      if (tournament.matchType === "solo") {
        user = await soloDataBase.find({ tournamentId: tournament._id }).sort({ slotId: -1 });
      } else if (tournament.matchType === "duo") {
        user = await duoDataBase.find({ tournamentId: tournament._id }).lean();
      } else if (tournament.matchType === "squad") {
        user = await squadDataBase.find({ tournamentId: tournament._id }).lean();
      }

      if (tournament.modeType === "cs") {
        const team1 = user.filter((u) => u.teamId === "team1");
        const team2 = user.filter((u) => u.teamId === "team2");
        return res.render("teamBasedPrizeDistribution", { user, tournament, admin, team1, team2 });
      }

      res.render("prizeDistribution", { user, tournament, admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminPrizeDistribution/:adminId/:tournamentId
  postPrizeDistribution: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      if (tournament.status === "completed") {
        return res.redirect(`/adminPanel/${req.params.adminId}`);
      }

      const users = JSON.parse(req.body.users);
      users.sort((a, b) => b.kills - a.kills);

      for (let i = 0; i < users.length; i++) {
        let reward = users[i].kills * tournament.perKillAmount;
        if (i === 0 && users[i].kills > 0) reward += tournament.firstPrize;
        if (i === 1 && users[i].kills > 0) reward += tournament.secondPrize;

        await userDataBase.findOneAndUpdate(
          { _id: users[i].userId },
          {
            $inc: {
              totalKill: users[i].kills,
              winning: reward,
              monthlyWinning: reward,
              totalBalance: reward,
            },
          }
        );
      }

      await tournamentLeadboardDataBase.create({
        tournamentId: tournament._id,
        player: users,
      });

      await tournamentDataBase.findOneAndUpdate({ _id: req.params.tournamentId }, { status: "completed" });
      res.redirect(`/adminPanel/${req.params.adminId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminPrizeDistribution/cs/:adminId/:tournamentId
  postPrizeDistributionCS: async (req, res) => {
    try {
      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      if (tournament.status === "completed") {
        return res.redirect(`/adminPanel/${req.params.adminId}`);
      }

      const users = JSON.parse(req.body.users);
      const amount = tournament.prizePool;
      let divider = 1;
      if (tournament.matchType === "duo") divider = 2;
      if (tournament.matchType === "squad") divider = 4;
      const share = amount / divider;

      for (let i = 0; i < users.length; i++) {
        await userDataBase.findOneAndUpdate(
          { _id: users[i].userId },
          {
            $inc: {
              winning: share,
              monthlyWinning: share,
              totalBalance: share,
            },
          }
        );
      }

      await tournamentLeadboardDataBase.create({
        tournamentId: tournament._id,
        player: users,
      });

      await tournamentDataBase.findOneAndUpdate({ _id: req.params.tournamentId }, { status: "completed" });
      res.redirect(`/adminPanel/${req.params.adminId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminRefund/:adminId/:tournamentId
  postRefundTournament: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const tournament = await tournamentDataBase.findOne({ _id: req.params.tournamentId }).lean();
      const players = tournament.slots.filter((userId) => userId !== null);

      for (let i = 0; i < players.length; i++) {
        await userDataBase.findOneAndUpdate(
          { _id: players[i] },
          {
            $inc: {
              totalBalance: tournament.entryFee,
              bonus: tournament.entryFee,
              totalMatch: -1,
            },
          }
        );

        const user = await userDataBase.findOne({ _id: players[i] });
        if (user?.email && user.emailPermission) {
          const refundMsg = `We're sorry! The tournament has been cancelled. Your entry fee of ₹${tournament.entryFee} has been successfully refunded to your wallet.`;
          await emailService.sendRefund(user.email, "Tournament Cancelled 😞", refundMsg);
        }

        await notificationDataBase.create({
          title: "Tournament Cancelled😞",
          message: `We're sorry! The tournament has been cancelled. Your entry fee of ₹${tournament.entryFee} has been successfully refunded to your wallet.`,
          userId: players[i],
        });
      }

      await tournamentDataBase.findOneAndDelete({ _id: req.params.tournamentId });
      res.redirect(`/adminPanel/${admin._id}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /tournament/setOngoing/:tournamentId/:adminId
  postSetOngoing: async (req, res) => {
    try {
      await tournamentDataBase.findOneAndUpdate(
        { _id: req.params.tournamentId },
        { status: req.body.status }
      );
      res.redirect(`/adminPanel/${req.params.adminId}`);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /monthlyPrizeDistribution/verification/:adminId
  getMonthlyPrizeVerification: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const otp = (Math.random() * 9000 + 1000).toFixed(0);
      await emailService.sendMail(process.env.email, "OTP FOR MONTHLY PRIZE DISTRIBUTION", otp);
      const pri = jwt.sign({ otp: otp }, process.env.PIN);
      res.cookie("pri", pri);
      res.render("monthlyPrizeDistributionVerification", { admin, error: "" });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /monthlyPrizeDistribution/:adminId
  postMonthlyPrizeDistribution: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const otp = jwt.verify(req.cookies.pri, process.env.PIN);
      if (String(req.body.otp) !== String(otp.otp)) {
        return res.render("monthlyPrizeDistributionVerification", {
          admin,
          error: "❌ Invalid OTP. Please try again.",
        });
      }

      const users = await userDataBase.find().sort({ monthlyWinning: -1 }).lean();
      for (let i = 0; i < users.length; i++) {
        if (users[i].monthlyWinning > 100) {
          if (i === 0) {
            await userDataBase.findOneAndUpdate(
              { _id: users[i]._id },
              { $inc: { totalBalance: 30, bonus: 30 } }
            );
            await notificationDataBase.create({
              title: "🎉 Monthly Leaderboard Winners! 🎉",
              message: `🎉 Congratulations ${users[i].username}! You are the #1 Champion of this month's leaderboard! 🏆 Reward: ₹30 added to wallet.`,
              userId: users[i]._id,
            });
          } else if (i === 1) {
            await userDataBase.findOneAndUpdate(
              { _id: users[i]._id },
              { $inc: { totalBalance: 20, bonus: 20 } }
            );
            await notificationDataBase.create({
              title: "🎉 Monthly Leaderboard Winners! 🎉",
              message: `👏 Well done ${users[i].username}! You secured 2nd place in this month's leaderboard! 🥈 Reward: ₹20 added to wallet.`,
              userId: users[i]._id,
            });
          } else if (i === 2) {
            await userDataBase.findOneAndUpdate(
              { _id: users[i]._id },
              { $inc: { totalBalance: 20, bonus: 20 } }
            );
            await notificationDataBase.create({
              title: "🎉 Monthly Leaderboard Winners! 🎉",
              message: `🙌 Nice work ${users[i].username}! You made it to 3rd place on the leaderboard! 🥉 Reward: ₹20 added to wallet.`,
              userId: users[i]._id,
            });
          }
        }
        await userDataBase.findOneAndUpdate({ _id: users[i]._id }, { monthlyWinning: 0 });
      }

      res.send("Monthly prize successfuly distributed✅");
    } catch (e) {
      res.redirect("/error");
    }
  },

  // GET /adminSendEmail/:adminId
  getAdminSendEmail: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }
      res.render("adminSendEmail", { admin });
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /adminSendEmail/:adminId
  postAdminSendEmail: async (req, res) => {
    try {
      const admin = await userDataBase.findOne({ _id: req.params.adminId }).lean();
      if (!isAdmin(admin)) {
        return res.redirect("/");
      }

      const expectedPass = process.env.email.split("@")[0] + "9";
      if (req.body.password !== expectedPass) {
        return res.status(400).send("❌ Invalid Admin Password. Email sending aborted.");
      }

      const users = await userDataBase.find({ emailPermission: true }).lean();
      if (!users || users.length === 0) {
        return res.send("ℹ️ No users found with email permission enabled.");
      }

      let successCount = 0;
      let failedCount = 0;
      const sampleErrors = [];

      // Send emails concurrently in batches of 5 to avoid SMTP timeouts
      const BATCH_SIZE = 5;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map((user) => emailService.sendAll(user.email, req.body.subject, req.body.message))
        );

        for (const r of results) {
          if (r.success) {
            successCount++;
          } else {
            failedCount++;
            if (sampleErrors.length < 5) {
              sampleErrors.push(r.to + ": " + r.error);
            }
          }
        }
      }

      let reportHtml = `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 40px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="margin-top:0;">📊 Email Broadcast Report</h2>
          <p><strong>Total Recipients Targeted:</strong> ${users.length}</p>
          <p style="color: green; font-size: 16px;"><strong>✅ Successfully Delivered:</strong> ${successCount}</p>
          <p style="color: ${failedCount > 0 ? '#d9534f' : '#6c757d'}; font-size: 16px;"><strong>❌ Failed Deliveries:</strong> ${failedCount}</p>
      `;

      if (failedCount > 0) {
        reportHtml += `
          <div style="background: #fff3f3; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 6px; margin: 16px 0;">
            <h4 style="margin: 0 0 8px 0;">Sample Error Details:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${sampleErrors.map((err) => "<li><small>" + err + "</small></li>").join("")}
            </ul>
            <p style="margin: 10px 0 0 0; font-size: 13px;">
              💡 <strong>Tip:</strong> If errors say <em>"Invalid login: 535-5.7.8 Username and Password not accepted"</em>, your Gmail App Password in <code>.env</code> needs to be refreshed.
            </p>
          </div>
        `;
      }

      reportHtml += `
          <br>
          <a href="/adminPanel/${admin._id}" style="display: inline-block; padding: 10px 18px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Return to Admin Panel</a>
        </div>
      `;

      return res.send(reportHtml);
    } catch (e) {
      console.error("Error in postAdminSendEmail:", e);
      res.redirect("/error");
    }
  },
};

module.exports = adminController;
