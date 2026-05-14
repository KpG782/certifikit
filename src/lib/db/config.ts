import type { SupabaseClient } from "@supabase/supabase-js";

export interface AppConfig {
  queueCap: number;
  batchSendCap: number;
  templateCap: number;
}

const DEFAULTS: AppConfig = {
  queueCap: 50,
  batchSendCap: 50,
  templateCap: 20,
};

// Cached config — refreshed at most once per minute to avoid hammering the DB.
let _cached: { value: AppConfig; expiresAt: number } | null = null;
const TTL_MS = 60_000;

export async function getAppConfig(client: SupabaseClient): Promise<AppConfig> {
  if (_cached && _cached.expiresAt > Date.now()) return _cached.value;

  const { data, error } = await client
    .from("app_config")
    .select("queue_cap, batch_send_cap, template_cap")
    .eq("id", 1)
    .maybeSingle();

  // If the table doesn't exist yet (pre-migration) or no row, fall back to defaults.
  if (error || !data) {
    _cached = { value: DEFAULTS, expiresAt: Date.now() + TTL_MS };
    return DEFAULTS;
  }

  const value: AppConfig = {
    queueCap: data.queue_cap ?? DEFAULTS.queueCap,
    batchSendCap: data.batch_send_cap ?? DEFAULTS.batchSendCap,
    templateCap: data.template_cap ?? DEFAULTS.templateCap,
  };
  _cached = { value, expiresAt: Date.now() + TTL_MS };
  return value;
}

// Test/dev helper — drop the cache so the next call re-reads.
export function _clearAppConfigCache() {
  _cached = null;
}
