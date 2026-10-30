const express = require("express");
const path = require("path");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();

// Proxy configuration (for deployment behind Render / Heroku / Nginx)
app.set("trust proxy", 1);

// HTTP Compression (bypass for webhooks to preserve raw payload)
app.use(
  compression({
    filter: (req, res) => {
      if (req.path.startsWith("/paymentCheck")) return false;
      return compression.filter(req, res);
    },
  })
);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(hpp());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Application Route Mounting
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", tournamentRoutes);
app.use("/", walletRoutes);
app.use("/", adminRoutes);
app.use("/", gameRoutes);

// Global Error Fallback
app.use((req, res) => {
  res.status(404).render("error");
});

app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err);
  res.status(500).render("error");
});

module.exports = app;
