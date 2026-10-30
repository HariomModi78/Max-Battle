const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDataBase = require("../models/userModel");
const notificationDataBase = require("../models/notification");
const emailService = require("../services/emailService");

const authController = {
  // GET /
  getRoot: async (req, res) => {
    if (req.cookies.token) {
      try {
        const token = jwt.verify(req.cookies.token, `${process.env.PIN}`);
        const user = await userDataBase.findOne({ email: token.email }).lean();
        if (user) {
          res.cookie("ad", "ad");
          return res.redirect(`/home/${user._id}`);
        }
        return res.redirect("/register");
      } catch (e) {
        return res.redirect("/register");
      }
    } else {
      return res.render("login");
    }
  },

  // GET /register
  getRegister: async (req, res) => {
    res.render("register");
  },

  // GET /registerOtp
  getRegisterOtp: (req, res) => {
    try {
      const email = jwt.verify(req.cookies.usec, process.env.PIN).email;
      res.render("registerOtp", { error: null, email: email });
    } catch (err) {
      res.redirect("/register");
    }
  },

  // GET /referralCodes
  getReferralCodes: async (req, res) => {
    try {
      let users = await userDataBase.find().lean();
      let referralCodes = users.map((user) => user.referralCode).filter(Boolean);
      referralCodes.push("NEW5");
      referralCodes.push("NEW1");
      res.json(referralCodes);
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /registerOtp
  postRegisterOtp: async (req, res) => {
    try {
      const otp = (Math.random() * 9000 + 1000).toFixed(0);
      let usec;
      const friend = await userDataBase.findOne({ referralCode: req.body.referralCode }).lean();

      const payload = {
        email: req.body.email,
        otp: otp,
        gameName: req.body.gameName,
        gameId: req.body.gameId,
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        referralCode: req.body.referralCode,
      };

      if (friend) {
        payload.referredBy = friend._id;
      }

      usec = jwt.sign(payload, process.env.PIN);

      await emailService.sendMail(req.body.email, "OTP FOR VERIFICATION", otp);
      res.cookie("usec", usec);
      res.redirect("/registerOtp");
    } catch (e) {
      res.redirect("/error");
    }
  },

  // POST /verifyRegisterOtp
  verifyRegisterOtp: async (req, res) => {
    try {
      const secret = jwt.verify(req.cookies.usec, process.env.PIN);

      if (secret.otp == req.body.otp) {
        const oldUser = await userDataBase.findOne({ email: secret.email }).lean();
        if (!oldUser) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(secret.password, salt);
          const isEighteenPlus = secret.age === "on";

          const newUser = await userDataBase.create({
            gameName: secret.gameName,
            gameId: secret.gameId,
            username: secret.username,
            email: secret.email,
            referralCode: secret.email.split("@")[0],
            password: hash,
            isEighteenPlus: isEighteenPlus,
            referredBy: secret.referredBy || undefined,
          });

          await notificationDataBase.create({
            title: "Welcome",
            message: `Welcome ${newUser.username}, new tournaments are waiting for you!"`,
            userId: newUser._id,
          });

          const admins = await userDataBase.find({ role: "admin" }).lean();
          for (let i = 0; i < admins.length; i++) {
            await notificationDataBase.create({
              title: "New User Update👤",
              message: `${newUser.username}, is a new user on MAX BATTLE`,
              userId: admins[i]._id,
            });
          }

          if (secret.referredBy) {
            await userDataBase.findOneAndUpdate(
              { _id: secret.referredBy },
              {
                $push: { totalReferral: newUser._id },
                $inc: { referrals: 1 },
              }
            );
          } else if (secret.referralCode === "NEW5") {
            await userDataBase.findOneAndUpdate(
              { _id: newUser._id },
              {
                $inc: { totalBalance: 5, bonus: 5 },
                isApplyCode: true,
              }
            );
            await notificationDataBase.create({
              title: "Joining Bonus🎉",
              message: `Hi ${newUser.username}, you earn 5 Max Coins as your joining bonus you can play matches from these coins`,
              userId: newUser._id,
            });
          } else if (secret.referralCode === "NEW1") {
            await userDataBase.findOneAndUpdate(
              { _id: newUser._id },
              {
                $inc: { totalBalance: 1, bonus: 1 },
                isApplyCode: true,
              }
            );
            await notificationDataBase.create({
              title: "Joining Bonus🎉",
              message: `Hi ${newUser.username}, you earn 1 Max Coins as your joining bonus you can play matches from these coins`,
              userId: newUser._id,
            });
          }

          const token = jwt.sign({ email: secret.email, role: "user" }, `${process.env.PIN}`);
          res.cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
          });

          return res.redirect(`/home/${newUser._id}`);
        } else {
          return res.redirect("/register");
        }
      } else {
        return res.render("registerOtp", { error: "Invalid OTP. Please try again.", email: secret.email });
      }
    } catch (e) {
      return res.redirect("/error");
    }
  },

  // GET /login
  getLogin: async (req, res) => {
    try {
      if (req.cookies.token) {
        const token = jwt.verify(req.cookies.token, `${process.env.PIN}`);
        const user = await userDataBase.findOne({ email: token.email }).lean();
        if (user) {
          return res.redirect(`/home/${user._id}`);
        }
      }
      return res.render("login");
    } catch (e) {
      return res.render("login");
    }
  },

  // POST /login
  postLogin: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ email: req.body.email }).lean();
      if (user) {
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) {
          const token = jwt.sign({ email: req.body.email, role: user.role || "user" }, `${process.env.PIN}`);
          res.cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
          });
          return res.redirect(`/home/${user._id}`);
        } else {
          return res.redirect("/login");
        }
      } else {
        return res.redirect("/register");
      }
    } catch (e) {
      return res.redirect("/register");
    }
  },

  // GET /logout
  logout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
  },

  // GET /formatePassword
  getForgotPassword: (req, res) => {
    res.render("formatePassword", { error: "" });
  },

  // POST /formatePassword
  postForgotPassword: async (req, res) => {
    try {
      const user = await userDataBase.findOne({ email: req.body.email }).lean();
      if (user) {
        const otp = (Math.random() * 9000 + 1000).toFixed(0);
        const secret = jwt.sign({ email: req.body.email, otp: otp }, process.env.PIN);
        await emailService.sendMail(req.body.email, "OTP FOR PASSWORD FORMATE", otp);
        res.cookie("secret", secret);
        return res.redirect("/otp");
      } else {
        return res.render("formatePassword", { error: "Invalid Email" });
      }
    } catch (e) {
      return res.redirect("/error");
    }
  },

  // GET /otp
  getOtp: (req, res) => {
    res.render("otp", { error: "" });
  },

  // POST /verifyOtp
  postVerifyOtp: async (req, res) => {
    try {
      const secret = jwt.verify(req.cookies.secret, process.env.PIN);
      if (secret.otp == req.body.otp) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.newPassword, salt);

        await userDataBase.findOneAndUpdate(
          { email: secret.email },
          { password: hash }
        );

        const token = jwt.sign({ email: secret.email, role: "user" }, `${process.env.PIN}`);
        res.cookie("token", token, {
          maxAge: 1000 * 60 * 60 * 24 * 365,
          httpOnly: true,
        });
        return res.redirect("/");
      } else {
        return res.render("otp", { error: "Invalid OTP. Please try again." });
      }
    } catch (e) {
      return res.redirect("/error");
    }
  },
};

module.exports = authController;
