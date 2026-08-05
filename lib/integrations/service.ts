import type { BuyerBrief } from "@/lib/brief-schema";
import type {
  DeliveryDependencies,
  DeliveryResult,
  DeliveryTarget,
  QueuedBrief,
} from "./types";

type DeliveryAttempt = {
  target: DeliveryTarget;
  available: boolean;
  send?: () => Promise<unknown>;
};

export async function deliver(
  item: QueuedBrief,
  deps: DeliveryDependencies,
): Promise<DeliveryResult> {
  const delivered: DeliveryTarget[] = [];
  const failed: DeliveryTarget[] = [];
  const unavailable: DeliveryTarget[] = [];

  item.attempts += 1;
  await deps.store.update(item);

  const attempts: DeliveryAttempt[] = [
    {
      target: "crm",
      available: Boolean(deps.crm),
      send: deps.crm ? () => deps.crm!.createLead(item.brief) : undefined,
    },
    {
      target: "ownerEmail",
      available: Boolean(deps.email),
      send: deps.email ? () => deps.email!.notifyOwner(item.brief) : undefined,
    },
    {
      target: "buyerEmail",
      available: Boolean(deps.email),
      send: deps.email ? () => deps.email!.confirmBuyer(item.brief) : undefined,
    },
  ];

  for (const attempt of attempts) {
    if (item.state[attempt.target]) continue;
    if (!attempt.available || !attempt.send) {
      unavailable.push(attempt.target);
      continue;
    }

    try {
      await attempt.send();
      item.state[attempt.target] = true;
      delivered.push(attempt.target);
      await deps.store.update(item);
    } catch {
      failed.push(attempt.target);
    }
  }

  const complete = Object.values(item.state).every(Boolean);
  if (complete) await deps.store.remove(item.id);

  return { complete, delivered, failed, unavailable };
}

export async function acceptBrief(
  brief: BuyerBrief,
  deps: DeliveryDependencies,
) {
  const item: QueuedBrief = {
    id: brief.submissionId,
    brief,
    state: { crm: false, ownerEmail: false, buyerEmail: false },
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  const reservation = await deps.store.reserve(item);
  if (reservation === "duplicate") {
    return { duplicate: true, complete: false };
  }

  const result = await deliver(item, deps);
  return { duplicate: false, complete: result.complete };
}
