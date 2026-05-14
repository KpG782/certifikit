import { describe, it, expect } from "vitest";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { mapUser } from "@/lib/auth";

const baseSupaUser = {
  id: "abc-123-def-456",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as SupabaseUser;

describe("mapUser", () => {
  it("returns null for null input", () => {
    expect(mapUser(null)).toBeNull();
  });

  it("derives username from email local part", () => {
    const user = mapUser({ ...baseSupaUser, email: "kenpatrick@example.com" } as SupabaseUser);
    expect(user?.username).toBe("kenpatrick");
    expect(user?.email).toBe("kenpatrick@example.com");
  });

  it("falls back to id slice when email is missing", () => {
    const user = mapUser({ ...baseSupaUser, email: undefined } as SupabaseUser);
    expect(user?.username).toBe("abc-123-");
  });

  it("prefers full_name from metadata over email for the name field", () => {
    const user = mapUser({
      ...baseSupaUser,
      email: "k@example.com",
      user_metadata: { full_name: "Ken Garcia" },
    } as SupabaseUser);
    expect(user?.name).toBe("Ken Garcia");
  });

  it("picks avatar_url from metadata when present", () => {
    const user = mapUser({
      ...baseSupaUser,
      email: "k@example.com",
      user_metadata: { avatar_url: "https://cdn/x.png" },
    } as SupabaseUser);
    expect(user?.avatarUrl).toBe("https://cdn/x.png");
  });
});
