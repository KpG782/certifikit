import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server supabase client before importing the module under test.
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser },
  }),
}));

import { requireUser, getOptionalUser } from "@/lib/auth/api";

beforeEach(() => {
  getUser.mockReset();
});

describe("requireUser", () => {
  it("returns 401 when no user", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await requireUser();
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it("returns the user when authenticated", async () => {
    const fakeUser = { id: "uuid", email: "k@example.com" };
    getUser.mockResolvedValue({ data: { user: fakeUser }, error: null });
    const result = await requireUser();
    expect(result).not.toBeInstanceOf(Response);
    expect((result as { user: typeof fakeUser }).user.id).toBe("uuid");
  });

  it("returns 401 when getUser errors", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "bad jwt" },
    });
    const result = await requireUser();
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });
});

describe("getOptionalUser", () => {
  it("returns null when no user", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await getOptionalUser()).toBeNull();
  });

  it("returns the user when present", async () => {
    const fakeUser = { id: "uuid" };
    getUser.mockResolvedValue({ data: { user: fakeUser }, error: null });
    expect(await getOptionalUser()).toEqual(fakeUser);
  });
});
