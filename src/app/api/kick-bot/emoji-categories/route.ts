import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const CATEGORIES_PATH = path.join(BOT_DIR, "emoji_categories.json");

export async function GET() {
  try {
    if (!fs.existsSync(CATEGORIES_PATH)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(CATEGORIES_PATH, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch emoji categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const categories = await request.json();
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emoji categories" }, { status: 500 });
  }
}
