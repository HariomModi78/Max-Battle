const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const fs = require("fs");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");

const crypto = require("crypto");

const userDataBase = require("./models/userModel.js");
const tournamentDataBase = require("./models/tournamentModel.js");
const tournamentLeadboardDataBase = require("./models/tournamentLeadboard.js");
const transactionDataBase = require("./models/transactionModel.js");
const soloDataBase = require("./models/soloModel.js");
const duoDataBase = require("./models/duoModel.js");
const squadDataBase = require("./models/squadModel.js");
const notificationDataBase = require("./models/notification.js");
const nodemailer = require("nodemailer");
const notification = require("./models/notification.js");
const { channel } = require("diagnostics_channel");
const { permission, send } = require("process");
