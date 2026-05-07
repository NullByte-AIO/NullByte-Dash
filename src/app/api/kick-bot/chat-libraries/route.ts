import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOT_DIR = "k:/Development/NullByte/NullByte Kick Backend";
const CHATS_DIR = path.join(BOT_DIR, "chats");

export async function GET() {
  try {
    if (!fs.existsSync(CHATS_DIR)) {
      return NextResponse.json({});
    }

    const files = fs.readdirSync(CHATS_DIR).filter(f => f.endsWith(".txt"));
    const libraries: Record<string, string[]> = {};

    files.forEach(file => {
      const name = file.replace(".txt", "");
      const content = fs.readFileSync(path.join(CHATS_DIR, file), "utf8");
      libraries[name] = content.split("\n").filter(line => line.trim() !== "");
    });

    return NextResponse.json(libraries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat libraries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, content, action } = await request.json();
    
    if (!fs.existsSync(CHATS_DIR)) {
      fs.mkdirSync(CHATS_DIR, { recursive: true });
    }

    const filePath = path.join(CHATS_DIR, `${name}.txt`);

    if (action === "delete") {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return NextResponse.json({ success: true });
    }

    // Default action: Save/Update
    fs.writeFileSync(filePath, content, "utf8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update chat library" }, { status: 500 });
  }
}
