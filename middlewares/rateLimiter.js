const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,                  // 50 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts. Try again after 10 minutes.",
});

module.exports = {
  authLimiter,
};
