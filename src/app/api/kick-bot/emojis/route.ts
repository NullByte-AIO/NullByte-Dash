import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const EMOJI_PATH = path.join(BOT_DIR, "emojis.json");

export async function GET() {
  try {
    if (!fs.existsSync(EMOJI_PATH)) {
      return NextResponse.json([]);
    }

    const data = fs.readFileSync(EMOJI_PATH, "utf8");
    const emojiMap = JSON.parse(data);
    
    // Transform to array for UI
    const emojis = Object.entries(emojiMap).map(([name, val]: [string, any]) => {
      if (typeof val === 'string') {
        return { name, code: val, image: `${name}.png` };
      }
      return {
        name,
        code: val.code || "",
        image: val.image || `${name}.png`
      };
    });

    return NextResponse.json(emojis);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read emojis" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newEmojis = await request.json();
    fs.writeFileSync(EMOJI_PATH, JSON.stringify(newEmojis, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emojis" }, { status: 500 });
  }
}
