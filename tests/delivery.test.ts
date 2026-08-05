import { describe, expect, it, vi } from "vitest";
import { acceptBrief, deliver } from "@/lib/integrations/service";
import type { LeadStore, QueuedBrief } from "@/lib/integrations/types";
import { brief } from "./fixtures";

function createStore() {
  let saved: QueuedBrief | undefined;
  const store: LeadStore = {
    reserve: vi.fn(async (item: QueuedBrief): Promise<"created"> => {
      saved = structuredClone(item);
      return "created";
    }),
    update: vi.fn(async (item) => {
      saved = structuredClone(item);
    }),
    remove: vi.fn(async () => {
      saved = undefined;
    }),
    list: vi.fn(async () => (saved ? [structuredClone(saved)] : [])),
  };
  return { store, saved: () => saved };
}

describe("durable delivery", () => {
  it("delivers Resend while HubSpot is unconfigured and retains CRM work", async () => {
    const { store, saved } = createStore();
    const email = {
      notifyOwner: vi.fn(async () => undefined),
      confirmBuyer: vi.fn(async () => undefined),
    };

    const result = await acceptBrief(brief, { store, email });

    expect(result.complete).toBe(false);
    expect(email.notifyOwner).toHaveBeenCalledOnce();
    expect(email.confirmBuyer).toHaveBeenCalledOnce();
    expect(saved()?.state).toEqual({
      crm: false,
      ownerEmail: true,
      buyerEmail: true,
    });
    expect(store.remove).not.toHaveBeenCalled();
  });

  it("delivers HubSpot while Resend is unconfigured and retains email work", async () => {
    const { store, saved } = createStore();
    const crm = { createLead: vi.fn(async () => ({ externalId: "1" })) };

    const result = await acceptBrief(brief, { store, crm });

    expect(result.complete).toBe(false);
    expect(crm.createLead).toHaveBeenCalledOnce();
    expect(saved()?.state).toEqual({
      crm: true,
      ownerEmail: false,
      buyerEmail: false,
    });
    expect(store.remove).not.toHaveBeenCalled();
  });

  it("continues to later channels when one configured provider fails", async () => {
    const { store, saved } = createStore();
    const crm = {
      createLead: vi.fn(async () => {
        throw new Error("temporary");
      }),
    };
    const email = {
      notifyOwner: vi.fn(async () => undefined),
      confirmBuyer: vi.fn(async () => undefined),
    };

    const result = await acceptBrief(brief, { store, crm, email });

    expect(result.complete).toBe(false);
    expect(email.notifyOwner).toHaveBeenCalledOnce();
    expect(email.confirmBuyer).toHaveBeenCalledOnce();
    expect(saved()?.state).toEqual({
      crm: false,
      ownerEmail: true,
      buyerEmail: true,
    });
  });

  it("keeps a submission durable when no delivery channel is configured", async () => {
    const { store, saved } = createStore();

    const result = await acceptBrief(brief, { store });

    expect(result.complete).toBe(false);
    expect(saved()?.attempts).toBe(1);
    expect(saved()?.state).toEqual({
      crm: false,
      ownerEmail: false,
      buyerEmail: false,
    });
  });

  it("removes a queued submission only after every target succeeds", async () => {
    const { store } = createStore();
    const item: QueuedBrief = {
      id: brief.submissionId,
      brief,
      state: { crm: false, ownerEmail: false, buyerEmail: false },
      createdAt: new Date(0).toISOString(),
      attempts: 0,
    };
    const crm = { createLead: vi.fn(async () => ({ externalId: "1" })) };
    const email = {
      notifyOwner: vi.fn(async () => undefined),
      confirmBuyer: vi.fn(async () => undefined),
    };

    const result = await deliver(item, { store, crm, email });

    expect(result).toMatchObject({
      complete: true,
      delivered: ["crm", "ownerEmail", "buyerEmail"],
      failed: [],
      unavailable: [],
    });
    expect(store.remove).toHaveBeenCalledWith(brief.submissionId);
  });
});
