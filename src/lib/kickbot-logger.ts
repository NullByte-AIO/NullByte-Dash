/**
 * Shared helper for KickBot backend API communication.
 * All dashboard API routes use this to proxy requests to the Express backend
 * instead of reading files directly from disk.
 */

const BACKEND_URL = process.env.KICKBOT_BACKEND_URL || "http://localhost:3001";
const API_SECRET = process.env.KICKBOT_API_SECRET || "";

export function getBackendUrl(path: string): string {
  return `${BACKEND_URL}${path}`;
}

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_SECRET) {
    headers["x-api-key"] = API_SECRET;
  }
  return headers;
}

/**
 * Log an action through the backend API (appends to daily log file on the backend).
 */
export async function logAction(category: string, message: string, level: string = "INFO") {
  try {
    // Post a log entry as a command that the backend picks up
    await fetch(getBackendUrl("/api/command"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        action: "log",
        category,
        message,
        level,
      }),
    });
  } catch (err) {
    console.error(`Failed to send log to backend: ${err}`);
  }
}
