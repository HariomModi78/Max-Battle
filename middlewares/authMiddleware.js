const jwt = require("jsonwebtoken");
const userDataBase = require("../models/userModel");

/**
 * Check if a user object has admin role
 */
const isAdmin = (user) => {
  return Boolean(user && user.role === "admin");
};

/**
 * Verify JWT cookie middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.PIN);
    const user = await userDataBase.findOne({ email: decoded.email }).lean();

    if (!user) {
      res.clearCookie("token");
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

/**
 * Verify Admin role by :adminId param
 */
const requireAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.adminId;
    if (!adminId) {
      return res.redirect("/");
    }

    const admin = await userDataBase.findOne({ _id: adminId }).lean();
    if (!admin || admin.role !== "admin") {
      return res.redirect("/");
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.redirect("/");
  }
};

module.exports = {
  isAdmin,
  verifyToken,
  requireAdmin,
};
