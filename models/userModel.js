const mongoose = require("mongoose");
require('dotenv').config();


const uri = process.env.MONGO_URL

// Connect Mongoose properly
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout in case of connection issues
});

const db = mongoose.connection;

// Connection success
db.once("open", () => {
  console.log("Connected to MongoDB successfully!");
});

// Connection error handling
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});


const userSchema = mongoose.Schema({
    gameName:String,
    gameId:String,
    username:{
        type:String,
        required:true,
        uniqe:true
    },
    email:String,
    password:String,
    role:{
        type:String,
        default:"user"
    },
    totalMatch:{
        type:Number,
        default:0
    },
    totalKill:{
        type:Number,
        default:0
    },
    totalBalance:{
        type:Number,
        default:0
    },
    deposited:{
        type:Number,
        default:0
    },
    winning:{
        type:Number,
        default:0
    },
    monthlyWinning:{
        type:Number,
        default:0
    },
    bonus:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    promocode:String
});

module.exports = mongoose.model("user",userSchema)