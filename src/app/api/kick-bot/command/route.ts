import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { logAction } from "@/lib/kickbot-logger";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const COMMAND_PATH = path.join(BOT_DIR, "commands.json");

export async function POST(request: Request) {
  try {
    const command = await request.json();
    
    let commands = [];
    if (fs.existsSync(COMMAND_PATH)) {
      commands = JSON.parse(fs.readFileSync(COMMAND_PATH, "utf8"));
    }
    
    commands.push(command);
    fs.writeFileSync(COMMAND_PATH, JSON.stringify(commands, null, 2));

    // Log web-triggered commands
    if (command.action === 'send_msg') {
      logAction("CHAT", `Web Dispatch: "${command.message}"`);
    } else {
      logAction("SYSTEM", `Web Command Queued: ${command.action}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send command" }, { status: 500 });
  }
}
