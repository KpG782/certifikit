import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EmailQueueItem, EmailQueueStats } from "@/types/email-queue";

// Lazily build the Supabase client. Eager instantiation breaks `next build`
// page-data collection when env vars aren't present at build time.
//
// Prefers SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) when set, otherwise falls
// back to NEXT_PUBLIC_SUPABASE_ANON_KEY. With anon, RLS on email_queue must
// be disabled (or have permissive policies) — see the migration.
let _supabase: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  _supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}

const TABLE = "email_queue";
const COLS =
  "id, recipient_email, recipient_name, subject, message, certificate_image, status, error_message, created_at, sent_at";

interface EmailQueueRow {
  id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  message: string;
  certificate_image: string;
  status: EmailQueueItem["status"];
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
}

function toItem(row: EmailQueueRow): EmailQueueItem {
  return {
    id: row.id,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    subject: row.subject,
    message: row.message,
    certificateImage: row.certificate_image,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    sentAt: row.sent_at,
  };
}

export async function insertEmailQueue(data: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  certificateImage: string;
}): Promise<EmailQueueItem> {
  const { data: row, error } = await supabase()
    .from(TABLE)
    .insert({
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName,
      subject: data.subject,
      message: data.message,
      certificate_image: data.certificateImage,
      status: "pending",
    })
    .select(COLS)
    .single();

  if (error) throw error;
  return toItem(row as EmailQueueRow);
}

export async function getEmailQueue(filters?: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<EmailQueueItem[]> {
  let query = supabase()
    .from(TABLE)
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search)
    query = query.ilike("recipient_email", `%${filters.search}%`);
  if (filters?.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return (data as EmailQueueRow[]).map(toItem);
}

export async function getEmailQueueByIds(
  ids: number[]
): Promise<EmailQueueItem[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase().from(TABLE).select(COLS).in("id", ids);

  if (error) throw error;
  return (data as EmailQueueRow[]).map(toItem);
}

export async function updateEmailQueueStatus(data: {
  id: number;
  status: string;
  errorMessage?: string | null;
  sentAt?: string | null;
}): Promise<EmailQueueItem> {
  const { data: row, error } = await supabase()
    .from(TABLE)
    .update({
      status: data.status,
      error_message: data.errorMessage ?? null,
      sent_at: data.sentAt ?? null,
    })
    .eq("id", data.id)
    .select(COLS)
    .single();

  if (error) throw error;
  return toItem(row as EmailQueueRow);
}

export async function deleteEmailQueue(id: number): Promise<void> {
  const { error } = await supabase().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function getEmailQueueStats(): Promise<EmailQueueStats> {
  // Supabase REST has no SQL FILTER aggregate, so run count-only queries in parallel.
  const client = supabase();
  const [totalRes, pendingRes, sentRes, failedRes, cancelledRes] =
    await Promise.all([
      client.from(TABLE).select("id", { count: "exact", head: true }),
      client
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      client
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "sent"),
      client
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
      client
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "cancelled"),
    ]);

  for (const r of [totalRes, pendingRes, sentRes, failedRes, cancelledRes]) {
    if (r.error) throw r.error;
  }

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    sent: sentRes.count ?? 0,
    failed: failedRes.count ?? 0,
    cancelled: cancelledRes.count ?? 0,
  };
}

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase()
      .from(TABLE)
      .select("id", { head: true, count: "exact" })
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}
