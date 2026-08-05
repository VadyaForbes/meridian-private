import { describe, expect, it } from "vitest";
import {
  getIntegrations,
  IntegrationConfigurationError,
} from "@/lib/integrations/env";

const durableEnvironment = {
  UPSTASH_REDIS_REST_URL: "https://example.invalid",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  LEAD_ENCRYPTION_KEY: "test-encryption-key",
};

describe("integration configuration", () => {
  it("requires durable encrypted storage without requiring providers", () => {
    expect(() => getIntegrations({})).toThrowError(
      IntegrationConfigurationError,
    );

    try {
      getIntegrations({});
    } catch (error) {
      expect(error).toMatchObject({
        code: "integration_config_missing",
        missingVariables: [
          "UPSTASH_REDIS_REST_URL",
          "UPSTASH_REDIS_REST_TOKEN",
          "LEAD_ENCRYPTION_KEY",
        ],
      });
    }
  });

  it("configures Resend independently from HubSpot", () => {
    const integrations = getIntegrations({
      ...durableEnvironment,
      RESEND_API_KEY: "re_test",
      RESEND_FROM_EMAIL: "Meridian <briefs@example.invalid>",
      LEAD_NOTIFICATION_EMAIL: "owner@example.invalid",
    });

    expect(integrations.email).toBeDefined();
    expect(integrations.crm).toBeUndefined();
    expect(integrations.configuration).toEqual({
      channels: { crm: false, email: true },
      missing: { crm: ["HUBSPOT_ACCESS_TOKEN"], email: [] },
    });
  });

  it("configures HubSpot independently from Resend", () => {
    const integrations = getIntegrations({
      ...durableEnvironment,
      HUBSPOT_ACCESS_TOKEN: "pat-test",
    });

    expect(integrations.crm).toBeDefined();
    expect(integrations.email).toBeUndefined();
    expect(integrations.configuration.channels).toEqual({
      crm: true,
      email: false,
    });
    expect(integrations.configuration.missing.email).toEqual([
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
      "LEAD_NOTIFICATION_EMAIL",
    ]);
  });

  it("does not construct a partially configured Resend channel", () => {
    const integrations = getIntegrations({
      ...durableEnvironment,
      RESEND_API_KEY: "re_test",
    });

    expect(integrations.email).toBeUndefined();
    expect(integrations.configuration.missing.email).toEqual([
      "RESEND_FROM_EMAIL",
      "LEAD_NOTIFICATION_EMAIL",
    ]);
  });
});
