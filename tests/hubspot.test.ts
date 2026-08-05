import { afterEach, describe, expect, it, vi } from "vitest";
import { HubSpotAdapter, mapBriefToHubSpot } from "@/lib/integrations/hubspot";
import { brief } from "./fixtures";

describe("HubSpot mapping", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a brief to a lead contact without changing meaning", () => {
    expect(mapBriefToHubSpot(brief)).toMatchObject({
      email: "test-fixture@example.invalid",
      firstname: "Test",
      lastname: "Fixture",
      lifecyclestage: "lead",
      hs_lead_status: "NEW",
      meridian_purchase_country: "Test Destination",
      meridian_purchase_goal: "home",
      meridian_locale: "en",
    });
  });

  it("upserts by email so a retry updates the same contact", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ id: "contact-123" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(new HubSpotAdapter("token").createLead(brief)).resolves.toEqual({
      externalId: "contact-123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [
            {
              id: brief.email,
              idProperty: "email",
              properties: mapBriefToHubSpot(brief),
            },
          ],
        }),
      }),
    );
  });

  it("keeps failed HubSpot deliveries retryable without exposing provider details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );

    await expect(new HubSpotAdapter("token").createLead(brief)).rejects.toThrow(
      "crm_delivery_failed",
    );
  });
});
