const express = require("express");
const path = require("path");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");

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

// Express 5 compatible in-place NoSQL sanitization
// (Express 5 treats req.query as a getter-only property; this mutates keys in-place without reassignment)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);
  next();
});

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
