# Meridian Private

Production-ready international real-estate advisory website built with Next.js App Router and TypeScript.

## Local development

1. Copy `.env.example` to `.env.local` and fill the variables.
2. Run `npm install` and `npm run dev`.

The Buyer Brief fails closed unless durable Upstash storage and encryption are configured. Leads are encrypted before delivery is attempted. HubSpot and Resend are independent channels: every configured channel is attempted, while unconfigured or temporarily failed deliveries remain in the durable queue for the protected Vercel cron route. The application never falls back to a volatile in-memory production queue.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
