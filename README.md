# Meridian Private

Production-ready international real-estate advisory website built with Next.js App Router and TypeScript.

## Local development

1. Copy `.env.example` to `.env.local` and fill the variables.
2. Run `npm install` and `npm run dev`.

The Buyer Brief fails closed unless durable Upstash storage, HubSpot, Resend, and encryption variables are configured. Leads are encrypted before being queued. Successful deliveries are removed; temporary provider failures remain retry-ready and are processed by the protected Vercel cron route.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
