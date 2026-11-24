# PostLocal

The local business marketing planner. One repository holds the Next.js web app, the Expo app, and the shared planning rules. The founding preview is a Greater Magnolia, Texas edition. Group names, counts and rules are labeled fixtures.

Live selling stays off until a business lead approves the offer, the Stripe account and the refund terms.

## Apps

- `apps/web` — Next.js buyer site, planner, publisher workspace and `/api/v1`
- `apps/mobile` — Expo Router app for iOS and Android. It talks only to the API
- `packages/domain` — eligibility, calendar, drafts and workbook checks, with tests
- `packages/contracts` — request schemas and response types
- `packages/api-client` — typed fetch client used by the phone
- `packages/db/migrations/0001_init.sql` — PostgreSQL schema for when a database is attached

The local API stores data in `apps/web/data/runtime-store.json`. That file is gitignored. On Vercel the filesystem is not durable, so a preview can browse the seed and a warm instance can hold a test purchase. Connect Postgres before treating a deployment as the system of record.

## Local setup

```bash
pnpm install
pnpm dev
```

The web app runs at [http://localhost:3000](http://localhost:3000).

In another terminal, point Expo at that API. A simulator on the same machine can use localhost. A physical phone needs your computer’s LAN address.

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 pnpm dev:mobile
```

```bash
pnpm test
pnpm typecheck
```

## Fixture accounts

| Who | Email | What they can do |
| --- | --- | --- |
| Sara Hale | sara@wildorchid.example | Buyer with the founding edition, a week plan and a draft |
| Alex Ruiz | alex@marketmap.example | Publisher queue, import preview, publish |
| New account | any email | Starts without the edition so you can walk test checkout |

Test checkout is not Stripe. The return page asks the server to confirm the order. A redirect alone does not unlock files. “Reset test access” on the library revokes that demo entitlement.

## Vercel

Create a project from this repository.

- Root Directory: `apps/web`
- Include source files outside the root directory: on
- Framework: Next.js
- Install command can stay the default pnpm install from the workspace root

Set `SELLING_ENABLED` only after the business lead approves a real price. Until then leave it empty. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` when the Stripe account exists, and point the webhook at `/api/v1/stripe/webhook`. The handler checks the raw signature, ignores events that are not a completed Checkout Session, and will not grant a second entitlement for the same event.

Production handoff still needs: the owner’s Git connection, a Postgres backup and migration step, a rollback note, and the Stripe dashboard webhook. Those are blocked on account access and are separate from this preview.

## Expo EAS

`apps/mobile/eas.json` has development, preview and production profiles. Install the EAS CLI when you are ready to build, sign in, and run `eas build` from `apps/mobile`. Put the deployed API URL in `EXPO_PUBLIC_API_URL` for the preview and production profiles. Native purchase buttons are intentionally absent. Buyers sign in and open an edition they already own.

Store listing, signing keys and a physical device pass are the remaining release steps.

## What this preview proves

A signed-in buyer can find the Magnolia edition, open the same account on the web, filter groups, add a verified slot, generate a draft that does not invent an offer, copy it, open the group link, and mark the task posted. Publishers can see stale, unknown, subthreshold and misleading-link cases without shipping them as suggestions.

Graphic templates and push reminders are the next milestone. Recurring billing, more geographies and agency licensing are later.
