import type { SupabaseClient } from "@supabase/supabase-js";
import type { TextElement, ImageElement } from "@/types/certificates";

export interface CertificatePayload {
  textElements: TextElement[];
  imageElements: ImageElement[];
  background?: {
    templateId?: string | null;
    imagePath?: string | null;
    color?: string | null;
  };
  canvas?: {
    width: number;
    height: number;
  };
}

export interface CertificateRow {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  payload: CertificatePayload;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE = "certificates";
const COLS = "id, user_id, template_id, title, payload, image_url, created_at, updated_at";

export async function listCertificates(client: SupabaseClient): Promise<CertificateRow[]> {
  const { data, error } = await client
    .from(TABLE)
    .select(COLS)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CertificateRow[];
}

export async function getCertificate(
  client: SupabaseClient,
  id: string,
): Promise<CertificateRow | null> {
  const { data, error } = await client.from(TABLE).select(COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as CertificateRow | null) ?? null;
}

export async function createCertificate(
  client: SupabaseClient,
  input: {
    userId: string;
    templateId?: string | null;
    title?: string;
    payload: CertificatePayload;
    imageUrl?: string | null;
  },
): Promise<CertificateRow> {
  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      template_id: input.templateId ?? null,
      title: input.title ?? "Untitled Certificate",
      payload: input.payload,
      image_url: input.imageUrl ?? null,
    })
    .select(COLS)
    .single();
  if (error) throw error;
  return data as CertificateRow;
}

export async function updateCertificate(
  client: SupabaseClient,
  id: string,
  patch: Partial<{
    title: string;
    payload: CertificatePayload;
    image_url: string | null;
    template_id: string | null;
  }>,
): Promise<CertificateRow> {
  const { data, error } = await client
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) throw error;
  return data as CertificateRow;
}

export async function deleteCertificate(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
