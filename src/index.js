import dotenv from "dotenv";
import fs from "fs";
import moment from "moment-timezone";
import connectDB from "./db/index.js";
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
  logStream.write(logMessage); // Write to the file
  originalConsoleLog(logMessage); // Print to console
};

// Override console.error to log errors to a file
const originalConsoleError = console.error;
console.error = (message) => {
  const logMessage = `[${getTimestamp()}] ERROR: ${message}\n`;
  logStream.write(logMessage); // Write to the file
  originalConsoleError(logMessage); // Print to console
};

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running !! PORT: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server run failed !! ", error);
  });
