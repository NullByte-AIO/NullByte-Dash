import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BACKEND_PATH = "k:/Development/NullByte/NullByte Kick Backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let filePath = "";
  if (type === "messages") filePath = path.join(BACKEND_PATH, "messages.json");
  else if (type === "emojis") filePath = path.join(BACKEND_PATH, "emojis.json");
  else if (type === "words") filePath = path.join(BACKEND_PATH, "words.txt");
  else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (type === "words") return NextResponse.json({ content });
    return NextResponse.json(JSON.parse(content));
  } catch (e) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const data = await request.json();

  let filePath = "";
  if (type === "messages") filePath = path.join(BACKEND_PATH, "messages.json");
  else if (type === "emojis") filePath = path.join(BACKEND_PATH, "emojis.json");
  else if (type === "words") filePath = path.join(BACKEND_PATH, "words.txt");
  else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  try {
    const content = type === "words" ? data.content : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, "utf8");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
