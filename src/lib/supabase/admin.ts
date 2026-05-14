import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client. Bypasses RLS.
// Use only for system-level operations: n8n callbacks, admin tasks, background
// jobs. NEVER import from a client component. NEVER use it to read user data
// on behalf of a user — always scope by user_id in app code if you must.
let _admin: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin env vars missing — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
