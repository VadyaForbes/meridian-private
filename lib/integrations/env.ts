import { ResendAdapter } from "./emails";
import { HubSpotAdapter } from "./hubspot";
import { UpstashLeadStore } from "./store";
import type {
  IntegrationConfiguration,
  IntegrationDependencies,
} from "./types";

const storageVariables = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "LEAD_ENCRYPTION_KEY",
] as const;
const crmVariables = ["HUBSPOT_ACCESS_TOKEN"] as const;
const emailVariables = [
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "LEAD_NOTIFICATION_EMAIL",
] as const;

type Environment = Record<string, string | undefined>;

function missing(environment: Environment, variables: readonly string[]) {
  return variables.filter((name) => !environment[name]?.trim());
}

export class IntegrationConfigurationError extends Error {
  readonly code = "integration_config_missing";

  constructor(readonly missingVariables: string[]) {
    super(`Missing required durable integration configuration: ${missingVariables.join(", ")}`);
    this.name = "IntegrationConfigurationError";
  }
}

export function getIntegrations(
  environment: Environment = process.env,
): IntegrationDependencies {
  const missingStorage = missing(environment, storageVariables);
  if (missingStorage.length) {
    throw new IntegrationConfigurationError(missingStorage);
  }

  const missingCrm = missing(environment, crmVariables);
  const missingEmail = missing(environment, emailVariables);
  const configuration: IntegrationConfiguration = {
    channels: {
      crm: missingCrm.length === 0,
      email: missingEmail.length === 0,
    },
    missing: {
      crm: missingCrm,
      email: missingEmail,
    },
  };

  const store = new UpstashLeadStore(
    environment.UPSTASH_REDIS_REST_URL!,
    environment.UPSTASH_REDIS_REST_TOKEN!,
    environment.LEAD_ENCRYPTION_KEY!,
  );

  return {
    store,
    configuration,
    crm: configuration.channels.crm
      ? new HubSpotAdapter(environment.HUBSPOT_ACCESS_TOKEN!)
      : undefined,
    email: configuration.channels.email
      ? new ResendAdapter(
          environment.RESEND_API_KEY!,
          environment.RESEND_FROM_EMAIL!,
          environment.LEAD_NOTIFICATION_EMAIL!,
        )
      : undefined,
  };
}
