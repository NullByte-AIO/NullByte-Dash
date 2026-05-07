import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DASH_DIR = "k:/Development/NullByte/NullByte Dash";
const UPLOAD_DIR = path.join(DASH_DIR, "public", "images", "emojis");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get("action") as string; 
    
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    if (action === "upload") {
      const file = formData.get("file") as File;
      const emojiName = formData.get("name") as string;
      const oldFileName = formData.get("oldFileName") as string;

      if (!file || !emojiName) return NextResponse.json({ error: "Missing data" }, { status:400 });

      if (oldFileName) {
        const oldPath = path.join(UPLOAD_DIR, oldFileName);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".png";
      const fileName = `${emojiName}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ success: true, fileName });
    }

    if (action === "rename") {
      const oldFileName = formData.get("oldFileName") as string;
      const newName = formData.get("newName") as string;

      if (!oldFileName || !newName) return NextResponse.json({ error: "Missing data" }, { status:400 });

      const oldPath = path.join(UPLOAD_DIR, oldFileName);
      if (fs.existsSync(oldPath)) {
        const ext = path.extname(oldFileName);
        const newFileName = `${newName}${ext}`;
        const newPath = path.join(UPLOAD_DIR, newFileName);
        if (oldPath !== newPath) {
           fs.renameSync(oldPath, newPath);
        }
        return NextResponse.json({ success: true, fileName: newFileName });
      }
    }

    if (action === "bulk-sync") {
      const payload = formData.get("payload") as string;
      const emojis = JSON.parse(payload) as Array<{ name: string; code: string; image: string; enabled?: boolean }>;
      
      console.log(`[BULK-SYNC] Processing ${emojis.length} emojis...`);

      const results = emojis.map(emoji => {
        // More robust regex to handle potential spaces or variations
        const match = emoji.code.match(/\[emote:\d+:([^\]\s]+)\]/i);
        const extractedName = match ? match[1] : emoji.name;
        
        let finalImage = emoji.image;

        // If we found a name in the code, and it's different from the current display name
        if (extractedName && extractedName !== emoji.name) {
          console.log(`[BULK-SYNC] Renaming: ${emoji.name} -> ${extractedName}`);
          
          // Rename physical file if it exists
          if (emoji.image) {
            const oldPath = path.join(UPLOAD_DIR, emoji.image);
            if (fs.existsSync(oldPath)) {
              const ext = path.extname(emoji.image);
              const newImageName = `${extractedName}${ext}`;
              const newPath = path.join(UPLOAD_DIR, newImageName);
              
              if (oldPath !== newPath) {
                try {
                  fs.renameSync(oldPath, newPath);
                  finalImage = newImageName;
                  console.log(`[BULK-SYNC] File Renamed: ${emoji.image} -> ${newImageName}`);
                } catch (e) {
                  console.error(`[BULK-SYNC] File Rename Failed:`, e);
                }
              }
            }
          }
        }
        
        return { 
            ...emoji, 
            name: extractedName, 
            image: finalImage 
        };
      });

      return NextResponse.json({ success: true, updatedEmojis: results });
    }

    if (action === "delete") {
      const fileName = formData.get("fileName") as string;
      if (fileName) {
        const filePath = path.join(UPLOAD_DIR, fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Manage Error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
