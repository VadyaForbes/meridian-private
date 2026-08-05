import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getIntegrations,
  IntegrationConfigurationError,
} from "@/lib/integrations/env";
import { deliver } from "@/lib/integrations/service";

export const runtime = "nodejs";

const valid = (given: string | null, expected: string | undefined) => {
  if (!given || !expected) return false;
  const actual = Buffer.from(given);
  const wanted = Buffer.from(`Bearer ${expected}`);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
};

export async function GET(request: NextRequest) {
  if (!valid(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  try {
    const deps = getIntegrations();
    const items = await deps.store.list(25);
    let completed = 0;
    let failedAttempts = 0;

    for (const item of items) {
      const result = await deliver(item, deps);
      if (result.complete) completed += 1;
      failedAttempts += result.failed.length;
    }

    return NextResponse.json({
      processed: items.length,
      completed,
      pending: items.length - completed,
      failedAttempts,
      configuration: deps.configuration,
    });
  } catch (error) {
    if (error instanceof IntegrationConfigurationError) {
      return NextResponse.json(
        { code: error.code, missing: error.missingVariables },
        { status: 503 },
      );
    }
    return NextResponse.json({ code: "temporary" }, { status: 503 });
  }
}
