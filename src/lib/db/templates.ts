import type { SupabaseClient } from "@supabase/supabase-js";

export interface TemplateRow {
  id: string;
  user_id: string | null;
  name: string;
  image_path: string;
  is_system: boolean;
  is_public: boolean;
  width_px: number;
  height_px: number;
  created_at: string;
  updated_at: string;
}

const TABLE = "templates";
const COLS = "id, user_id, name, image_path, is_system, is_public, width_px, height_px, created_at, updated_at";

// Returns templates visible to the current user: their own + system + public.
// RLS filters this automatically; this query just orders the result.
export async function listVisibleTemplates(client: SupabaseClient): Promise<TemplateRow[]> {
  const { data, error } = await client
    .from(TABLE)
    .select(COLS)
    .order("is_system", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TemplateRow[];
}

export async function getTemplate(
  client: SupabaseClient,
  id: string,
): Promise<TemplateRow | null> {
  const { data, error } = await client.from(TABLE).select(COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as TemplateRow | null) ?? null;
}

export async function createUserTemplate(
  client: SupabaseClient,
  input: {
    userId: string;
    name: string;
    imagePath: string;
    isPublic?: boolean;
    widthPx?: number;
    heightPx?: number;
  },
): Promise<TemplateRow> {
  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      name: input.name,
      image_path: input.imagePath,
      is_system: false,
      is_public: input.isPublic ?? false,
      width_px: input.widthPx ?? 1200,
      height_px: input.heightPx ?? 850,
    })
    .select(COLS)
    .single();
  if (error) throw error;
  return data as TemplateRow;
}

export async function deleteUserTemplate(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq("id", id).eq("is_system", false);
  if (error) throw error;
}
