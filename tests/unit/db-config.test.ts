import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAppConfig, _clearAppConfigCache } from "@/lib/db/config";

function makeClient(result: { data?: unknown; error?: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };
  return { from: vi.fn(() => builder) };
}

beforeEach(() => {
  _clearAppConfigCache();
});

describe("getAppConfig", () => {
  it("returns defaults when app_config row missing", async () => {
    const client = makeClient({ data: null, error: null });
    const cfg = await getAppConfig(client as never);
    expect(cfg).toEqual({ queueCap: 50, batchSendCap: 50, templateCap: 20 });
  });

  it("returns defaults when table errors (pre-migration)", async () => {
    const client = makeClient({ data: null, error: { message: "table missing" } });
    const cfg = await getAppConfig(client as never);
    expect(cfg.queueCap).toBe(50);
  });

  it("returns DB-backed values when row exists", async () => {
    const client = makeClient({
      data: { queue_cap: 200, batch_send_cap: 100, template_cap: 40 },
      error: null,
    });
    const cfg = await getAppConfig(client as never);
    expect(cfg).toEqual({ queueCap: 200, batchSendCap: 100, templateCap: 40 });
  });

  it("caches subsequent calls within TTL", async () => {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(() => Promise.resolve({ data: { queue_cap: 75 }, error: null })),
    };
    const client = { from: vi.fn(() => builder) };
    await getAppConfig(client as never);
    await getAppConfig(client as never);
    await getAppConfig(client as never);
    expect(client.from).toHaveBeenCalledTimes(1);
  });
});
