import fs from "fs";
import path from "path";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const LOGS_DIR = path.join(BOT_DIR, "logs");

export function logAction(category: string, message: string, level: string = "INFO") {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timestamp = now.toLocaleTimeString();
    
    const logFile = path.join(LOGS_DIR, `${dateStr}.log`);
    const logEntry = JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      category: category.toUpperCase(),
      message
    });

    fs.appendFileSync(logFile, logEntry + "\n");
  } catch (err) {
    console.error(`Failed to write to web log file: ${err}`);
  }
}
