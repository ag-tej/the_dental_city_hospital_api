import dotenv from "dotenv";
import fs from "fs";
import moment from "moment-timezone";
import { closeDB, connectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const logFilePath = "server.log";
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Function to get the current timestamp in Asia/Kathmandu
function getTimestamp() {
  return moment().tz("Asia/Kathmandu").format("YYYY-MM-DD HH:mm:ss");
}

// Override console.log to log to a file
const originalConsoleLog = console.log;
console.log = (message) => {
  const logMessage = `[${getTimestamp()}] INFO: ${message}\n`;
  logStream.write(logMessage); // Write to the log file
  originalConsoleLog(logMessage); // Output to console
};

// Override console.error to log errors to a file
const originalConsoleError = console.error;
console.error = (message, error) => {
  const errorDetails = error ? ` | Details: ${error.stack || error}` : "";
  const logMessage = `[${getTimestamp()}] ERROR: ${message}${errorDetails}\n`;
  logStream.write(logMessage); // Write to the log file
  originalConsoleError(logMessage); // Output to console
};

// Function for graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(
    `Received shutdown signal: ${signal}. Initiating server shutdown...`
  );
  try {
    console.log("Closing database connection...");
    await closeDB();
    console.log("Server shutdown complete. Exiting process.");
    // Ensure all logs are flushed to the file before exiting
    logStream.end(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error("Error encountered during shutdown process", error);
    logStream.end(() => {
      process.exit(1);
    });
  }
};

const initialize = async () => {
  try {
    console.log("Initializing server startup sequence...");
    console.log("Establishing database connection...");
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(
        `Server is now live and listening on PORT ${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to initialize server", error);
    await gracefulShutdown("INIT_FAILURE"); // Clean up and exit on failure
  }
};

// Gracefully handle termination signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start the application
initialize();
