import { Pool } from "pg";
import { EmailQueueItem, EmailQueueStats } from "@/types/email-queue";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Set to true if your PostgreSQL server requires SSL
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on initialization
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL error:", err);
});

/**
 * Insert new email into queue
 */
export async function insertEmailQueue(data: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  certificateImage: string;
}): Promise<EmailQueueItem> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO email_queue 
      (recipient_email, recipient_name, subject, message, certificate_image, status) 
      VALUES ($1, $2, $3, $4, $5, 'pending') 
      RETURNING 
        id,
        recipient_email as "recipientEmail",
        recipient_name as "recipientName",
        subject,
        message,
        certificate_image as "certificateImage",
        status,
        error_message as "errorMessage",
        created_at as "createdAt",
        sent_at as "sentAt"
    `;

    const values = [
      data.recipientEmail,
      data.recipientName,
      data.subject,
      data.message,
      data.certificateImage,
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get email queue items with optional filters
 */
export async function getEmailQueue(filters?: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<EmailQueueItem[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        id,
        recipient_email as "recipientEmail",
        recipient_name as "recipientName",
        subject,
        message,
        certificate_image as "certificateImage",
        status,
        error_message as "errorMessage",
        created_at as "createdAt",
        sent_at as "sentAt"
      FROM email_queue 
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.search) {
      query += ` AND recipient_email ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters?.dateFrom) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters?.dateTo) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC";

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Update email queue item status
 */
export async function updateEmailQueueStatus(data: {
  id: number;
  status: string;
  errorMessage?: string | null;
  sentAt?: string | null;
}): Promise<EmailQueueItem> {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE email_queue 
      SET 
        status = $1, 
        error_message = $2, 
        sent_at = $3 
      WHERE id = $4 
      RETURNING 
        id,
        recipient_email as "recipientEmail",
        recipient_name as "recipientName",
        subject,
        message,
        certificate_image as "certificateImage",
        status,
        error_message as "errorMessage",
        created_at as "createdAt",
        sent_at as "sentAt"
    `;

    const values = [
      data.status,
      data.errorMessage || null,
      data.sentAt || null,
      data.id,
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Delete email queue item
 */
export async function deleteEmailQueue(id: number): Promise<void> {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM email_queue WHERE id = $1";
    await client.query(query, [id]);
  } finally {
    client.release();
  }
}

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats(): Promise<EmailQueueStats> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM email_queue
    `;

    const result = await client.query(query);
    const row = result.rows[0];

    return {
      total: parseInt(row.total, 10),
      pending: parseInt(row.pending, 10),
      sent: parseInt(row.sent, 10),
      failed: parseInt(row.failed, 10),
    };
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

export default pool;
