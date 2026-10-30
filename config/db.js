const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error("❌ MONGO_URL environment variable is missing.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
