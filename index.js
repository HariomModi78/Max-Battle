require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3544;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Max Battle Server running smoothly on http://localhost:${PORT}`);
    });

    // Graceful Shutdown handling
    const handleShutdown = () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        console.log("Closed out remaining connections.");
        process.exit(0);
      });
    };

    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
