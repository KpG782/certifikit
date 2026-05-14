import { describe, it, expect, vi } from "vitest";
import {
  listCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/db/certificates";

// Mock supabase-js's PostgrestBuilder: chainable AND thenable.
type Builder = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  then: (resolve: (v: unknown) => unknown) => Promise<unknown>;
};

function makeClient(result: { data?: unknown; error?: unknown }) {
  const builder = {} as Builder;
  Object.assign(builder, {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
  });
  const client = { from: vi.fn(() => builder) };
  return { client, builder };
}

const samplePayload = {
  textElements: [],
  imageElements: [],
};

describe("certificates db module", () => {
  it("listCertificates orders by updated_at desc", async () => {
    const row = { id: "c1", user_id: "u1", payload: samplePayload };
    const { client, builder } = makeClient({ data: [row], error: null });
    // order returns the awaited value
    const result = await listCertificates(client as never);
    expect(client.from).toHaveBeenCalledWith("certificates");
    expect(builder.select).toHaveBeenCalled();
    expect(builder.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(result).toEqual([row]);
  });

  it("getCertificate returns null when row missing", async () => {
    const { client } = makeClient({ data: null, error: null });
    const result = await getCertificate(client as never, "c1");
    expect(result).toBeNull();
  });

  it("createCertificate inserts user_id and default title", async () => {
    const inserted = { id: "c1", user_id: "u1", title: "Untitled Certificate", payload: samplePayload };
    const { client, builder } = makeClient({ data: inserted, error: null });
    const result = await createCertificate(client as never, {
      userId: "u1",
      payload: samplePayload,
    });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u1", title: "Untitled Certificate", payload: samplePayload }),
    );
    expect(result.id).toBe("c1");
  });

  it("updateCertificate applies the patch", async () => {
    const updated = { id: "c1", user_id: "u1", title: "Renamed", payload: samplePayload };
    const { client, builder } = makeClient({ data: updated, error: null });
    await updateCertificate(client as never, "c1", { title: "Renamed" });
    expect(builder.update).toHaveBeenCalledWith({ title: "Renamed" });
    expect(builder.eq).toHaveBeenCalledWith("id", "c1");
  });

  it("deleteCertificate hits the right id", async () => {
    const { client, builder } = makeClient({ data: null, error: null });
    await deleteCertificate(client as never, "c1");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "c1");
  });
});
