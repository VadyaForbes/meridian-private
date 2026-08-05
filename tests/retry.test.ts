import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  class IntegrationConfigurationError extends Error {
    readonly code = "integration_config_missing";
    constructor(readonly missingVariables: string[]) {
      super("configuration missing");
    }
  }
  return {
    getIntegrations: vi.fn(),
    deliver: vi.fn(),
    IntegrationConfigurationError,
  };
});

vi.mock("@/lib/integrations/env", () => ({
  getIntegrations: mocks.getIntegrations,
  IntegrationConfigurationError: mocks.IntegrationConfigurationError,
}));
vi.mock("@/lib/integrations/service", () => ({ deliver: mocks.deliver }));

import { GET } from "@/app/api/retry/route";

afterEach(() => {
  delete process.env.CRON_SECRET;
  vi.clearAllMocks();
});

describe("retry cron", () => {
  it("reports partial channel configuration without exposing queued PII", async () => {
    process.env.CRON_SECRET = "test-secret";
    const queued = { id: "private-item" };
    mocks.getIntegrations.mockReturnValue({
      store: { list: vi.fn(async () => [queued]) },
      email: {},
      configuration: {
        channels: { crm: false, email: true },
        missing: { crm: ["HUBSPOT_ACCESS_TOKEN"], email: [] },
      },
    });
    mocks.deliver.mockResolvedValue({
      complete: false,
      delivered: ["ownerEmail", "buyerEmail"],
      failed: [],
      unavailable: ["crm"],
    });

    const response = await GET(
      new NextRequest("http://localhost/api/retry", {
        headers: { authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      processed: 1,
      completed: 0,
      pending: 1,
      failedAttempts: 0,
      configuration: {
        channels: { crm: false, email: true },
        missing: { crm: ["HUBSPOT_ACCESS_TOKEN"], email: [] },
      },
    });
    expect(JSON.stringify(body)).not.toContain("private-item");
  });

  it("rejects unauthenticated diagnostics", async () => {
    process.env.CRON_SECRET = "test-secret";
    const response = await GET(
      new NextRequest("http://localhost/api/retry"),
    );

    expect(response.status).toBe(401);
    expect(mocks.getIntegrations).not.toHaveBeenCalled();
  });

  it("returns actionable durable-storage configuration to the protected cron", async () => {
    process.env.CRON_SECRET = "test-secret";
    mocks.getIntegrations.mockImplementation(() => {
      throw new mocks.IntegrationConfigurationError([
        "UPSTASH_REDIS_REST_TOKEN",
      ]);
    });

    const response = await GET(
      new NextRequest("http://localhost/api/retry", {
        headers: { authorization: "Bearer test-secret" },
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      code: "integration_config_missing",
      missing: ["UPSTASH_REDIS_REST_TOKEN"],
    });
  });
});
