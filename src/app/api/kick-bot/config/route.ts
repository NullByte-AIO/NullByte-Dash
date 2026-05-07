import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const CONFIG_PATH = path.join(BOT_DIR, "config.json");

export async function GET() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newConfig = await request.json();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
