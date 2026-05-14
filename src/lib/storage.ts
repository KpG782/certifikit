import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "media";
const DEFAULT_SIGNED_URL_TTL_S = 60 * 60; // 1 hour

export function certificatePath(userId: string, certificateId: string) {
  return `certificates/${userId}/${certificateId}.png`;
}

export function userTemplatePath(userId: string, templateId: string) {
  return `templates/${userId}/${templateId}.png`;
}

export function systemTemplatePath(filename: string) {
  return `system-templates/${filename}`;
}

// Accepts a base64 data URL (`data:image/png;base64,...`) or a raw base64 string,
// uploads to the `media` bucket at the given path, and returns a signed URL.
export async function uploadPngFromDataUrl(
  client: SupabaseClient,
  path: string,
  dataUrlOrBase64: string,
  opts: { upsert?: boolean; signedUrlTtlS?: number } = {},
): Promise<{ path: string; signedUrl: string }> {
  const base64 = dataUrlOrBase64.startsWith("data:")
    ? dataUrlOrBase64.split(",")[1]
    : dataUrlOrBase64;
  if (!base64) throw new Error("uploadPngFromDataUrl: empty data");

  const bytes = Buffer.from(base64, "base64");

  const { error: uploadErr } = await client.storage.from(MEDIA_BUCKET).upload(path, bytes, {
    contentType: "image/png",
    upsert: opts.upsert ?? true,
  });
  if (uploadErr) throw uploadErr;

  return { path, signedUrl: await signedUrl(client, path, opts.signedUrlTtlS) };
}

export async function uploadPngBlob(
  client: SupabaseClient,
  path: string,
  blob: Blob,
  opts: { upsert?: boolean; signedUrlTtlS?: number } = {},
): Promise<{ path: string; signedUrl: string }> {
  const { error: uploadErr } = await client.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || "image/png",
    upsert: opts.upsert ?? true,
  });
  if (uploadErr) throw uploadErr;
  return { path, signedUrl: await signedUrl(client, path, opts.signedUrlTtlS) };
}

export async function signedUrl(
  client: SupabaseClient,
  path: string,
  ttlSeconds: number = DEFAULT_SIGNED_URL_TTL_S,
): Promise<string> {
  const { data, error } = await client.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, ttlSeconds);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error(`signedUrl: missing url for ${path}`);
  return data.signedUrl;
}

export async function deleteObject(client: SupabaseClient, path: string): Promise<void> {
  const { error } = await client.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw error;
}
