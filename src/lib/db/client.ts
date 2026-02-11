import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Convert absolute path to file URL for Windows
const dbPath = path.join(dataDir, "certificates.db");
const dbUrl = `file:${dbPath.replace(/\\/g, "/")}`;

const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client, { schema });

// Initialize database
export function initDb() {
  client.execute(`
    CREATE TABLE IF NOT EXISTS email_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      certificate_image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      sent_at TEXT
    )
  `).catch(err => {
    console.error("Failed to initialize database:", err);
  });
}

initDb();
