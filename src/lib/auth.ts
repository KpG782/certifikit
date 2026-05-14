// Supabase-backed auth. Replaces the previous localStorage fake auth.

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export function mapUser(supaUser: SupabaseUser | null): User | null {
  if (!supaUser) return null;

  const email = supaUser.email ?? "";
  const meta = (supaUser.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    undefined;

  return {
    id: supaUser.id,
    email,
    name: fullName || email || "User",
    username: email ? email.split("@")[0] : supaUser.id.slice(0, 8),
    avatarUrl,
  };
}

export async function signInWithGoogle(redirectTo?: string): Promise<void> {
  const supabase = createClient();
  const next = redirectTo ?? "/dashboard";
  const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
    next
  )}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl },
  });
  if (error) throw error;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  const user = mapUser(data.user);
  if (!user) throw new Error("Login succeeded but no user returned");
  return user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User | null; needsEmailConfirmation: boolean }> {
  const supabase = createClient();
  const callbackUrl = `${window.location.origin}/auth/callback?next=/dashboard`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) throw error;

  // If Supabase email confirmation is enabled, session is null until the
  // user clicks the email link. Surface that so the UI can show a message.
  const needsEmailConfirmation = !data.session;
  return {
    user: mapUser(data.user),
    needsEmailConfirmation,
  };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
