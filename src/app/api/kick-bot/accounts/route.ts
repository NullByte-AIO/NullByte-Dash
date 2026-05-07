import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { logAction } from "@/lib/kickbot-logger";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const DB_PATH = path.join(BOT_DIR, "database.json");

export async function GET() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDatabase = await request.json();
    fs.writeFileSync(DB_PATH, JSON.stringify(newDatabase, null, 2));
    
    // Log the action
    const accountCount = Object.keys(newDatabase.accounts || {}).length;
    logAction("ACCOUNTS", `Database updated via Web Dashboard. Total accounts: ${accountCount}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
  }
}
