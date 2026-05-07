import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { streamerLink } = await request.json();
    
    // Extract username from link
    const match = streamerLink.match(/kick\.com\/([a-zA-Z0-9_]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid Kick link format." }, { status: 400 });
    }
    
    const username = match[1];
    
    // Fetch from Kick API
    // Note: Kick API often requires specific headers or might be blocked by Cloudflare.
    // This is a basic implementation.
    const response = await fetch(`https://kick.com/api/v1/channels/${username}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Streamer not found or API unreachable." }, { status: 404 });
    }
    
    const data = await response.json();
    
    if (!data.chatroom || !data.chatroom.id) {
      return NextResponse.json({ error: "Could not retrieve chatroom ID." }, { status: 500 });
    }
    
    return NextResponse.json({
      streamerName: data.user.username,
      chatroomId: data.chatroom.id.toString(),
      isOffline: !data.livestream
    });
    
  } catch (error) {
    console.error("Fetch Streamer Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
