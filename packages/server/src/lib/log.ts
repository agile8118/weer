import fs from "fs";
import path from "path";

/*
  if the message parameter is object we log error and if it's string we log info
*/

// Base log directory — ensure it exists once at startup
const baseDir = new URL("../../logs", import.meta.url).pathname;
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

// Persistent write stream for info logs — rotates automatically at day rollover
let currentDay = "";
let infoStream: fs.WriteStream | null = null;

function ensureStream(dir: string): void {
  if (dir === currentDay) return;

  // Close the old stream before rotating to the new day's file
  infoStream?.end();

  // Create the new day directory and open a fresh stream
  fs.mkdirSync(dir, { recursive: true });
  infoStream = fs.createWriteStream(dir + "/info.log", { flags: "a" });
  currentDay = dir;

  // If the logs dir gets deleted mid-run, reset so the next write triggers re-creation
  infoStream.on("error", (err: NodeJS.ErrnoException) => {
    console.error("Error writing to log stream:", err);
    if (err.code === "ENOENT") {
      currentDay = "";
      infoStream = null;
    } else {
      console.error(err);
    }
  });
}

// Detect if the log file is deleted mid-run. On Unix, open file descriptors stay valid
// after unlink so write errors never fire. We poll instead to catch this case.
setInterval(() => {
  if (!currentDay) return;
  fs.access(currentDay + "/info.log", fs.constants.F_OK, (err) => {
    if (!err) return;
    console.warn("[!] Log file missing, resetting stream...");
    infoStream?.destroy();
    currentDay = "";
    infoStream = null;
  });
}, 5000).unref();

export default (message: string | Error): void => {
  // Format the current date to use for each log
  const d = new Date();
  const dateString =
    d.getUTCFullYear() +
    "-" +
    ("0" + (d.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getUTCDate()).slice(-2) +
    " " +
    ("0" + d.getUTCHours()).slice(-2) +
    ":" +
    ("0" + d.getUTCMinutes()).slice(-2) +
    ":" +
    ("0" + d.getUTCSeconds()).slice(-2);

  // Create folders in log folder for better log organization based on each day
  const dir =
    baseDir +
    "/" +
    d.getUTCFullYear() +
    "-" +
    ("0" + (d.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getUTCDate()).slice(-2);

  // If we either pass an object or specify the second parameter as error
  if (typeof message === "object") {
    const errorStr = JSON.stringify(message, [
      "message",
      "arguments",
      "type",
      "name",
      "stack",
    ]);

    const errStack = JSON.parse(errorStr).stack
      ? "\n" + "Error Stack:\n" + JSON.parse(errorStr).stack
      : "";
    const errMessage = JSON.parse(errorStr).message
      ? "\n" + "Error Message: " + JSON.parse(errorStr).message
      : "";
    const errArguments = JSON.parse(errorStr).arguments
      ? "\n" + "Error Arguments: " + JSON.parse(errorStr).arguments
      : "";
    const errType = JSON.parse(errorStr).type
      ? "\n" + "Error Type: " + JSON.parse(errorStr).type
      : "";
    const errName = JSON.parse(errorStr).name
      ? "\n" + "Error Name: " + JSON.parse(errorStr).name
      : "";

    // Prepare the message to be logged
    const msg =
      "---------------------------------------\n" +
      dateString +
      errName +
      errMessage +
      errType +
      errArguments +
      errStack +
      "\n" +
      "---------------------------------------\n";
    // Add the log message to errors.log file in the right directory
    fs.appendFile(dir + "/errors.log", msg, function (err) {
      if (!err) return;
      if (err.code === "ENOENT") {
        fs.mkdirSync(dir, { recursive: true });
        fs.appendFile(dir + "/errors.log", msg, (err2) => {
          if (err2) console.error(err2);
        });
      } else {
        console.error(err);
      }
    });
  }

  // If we pass a string to the function
  if (typeof message === "string") {
    // Prepare the message to be logged
    const msg = dateString + " -- " + message + "\n";
    // Write to the persistent stream — rotates automatically when the day changes
    ensureStream(dir);

    infoStream?.write(msg);
  }
};
