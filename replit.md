# SharpTracker

## What This Is

A professional dark-themed sports odds movement tracker for sharp bettors. Users monitor significant odds movements in real time, track bets, and calculate stake sizes. The platform includes a marketing landing page, user authentication, and subscription-based access.

## Features

- Real-time odds movement feed (Pinnacle polling, WebSocket push)
- Sport, league, and movement direction filters
- Bet Tracker with auto-settle and CLV/EV tracking
- Top Movers page highlighting biggest single moves
- Alert configuration system (customisable minimum drop thresholds)
- Landing page with hero, features, pricing, FAQ, testimonials, legal pages
- User authentication via Clerk (Google sign-in + email)
- Subscription purchasing via Stripe (Silver €34.99/mo, Gold €84.99/mo)
- Dark terminal aesthetic (bg `240 5% 4%`, cyan primary `186 100% 50%`)

---

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: Clerk (`@clerk/express` on server, `@clerk/react` on clients)
- **Payments**: Stripe + `stripe-replit-sync` (integration via Replit connector)
- **Frontend**: React 19 + Vite + TailwindCSS v4 + Wouter routing + Framer Motion
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for api-server)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (Clerk auth, Stripe webhooks, odds polling)
│   ├── landing/            # SharpTracker marketing landing page (ClerkProvider, PricingPage)
│   └── odds-dropper/       # Main app — gated behind Clerk sign-in
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks + fetch client
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/                # Utility scripts (seed-products.ts, etc.)
├── pnpm-workspace.yaml     # workspace config
├── tsconfig.base.json      # Shared TS options
└── package.json            # Root with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — `pnpm run typecheck`
- **`emitDeclarationOnly`** — actual JS bundling is esbuild/vite, not `tsc`

## Root Scripts

- `pnpm run build` — typecheck then recursive `build`
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

---

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.

- **Auth**: `@clerk/express` — `clerkMiddleware()` + proxy at `__clerk_proxy`
- **Stripe**: webhook route registered BEFORE `express.json()` using `express.raw()`
- **Routes**: `src/routes/index.ts` mounts sub-routers including `stripe.ts` and `user.ts`
- **Key files**:
  - `src/app.ts` — Clerk proxy, Stripe webhook, CORS, JSON, clerkMiddleware
  - `src/stripeClient.ts` — `getUncachableStripeClient()` + `getStripeSync()` (updated after Stripe integration)
  - `src/webhookHandlers.ts` — `WebhookHandlers.processWebhook()`
  - `src/storage.ts` — `Storage` class (users CRUD + stripe schema queries)
  - `src/stripeService.ts` — checkout session, customer portal, customer creation
  - `src/routes/stripe.ts` — GET /stripe/products, POST /stripe/checkout, POST /stripe/portal
  - `src/routes/user.ts` — GET/POST /user (Clerk userId → DB user)
  - `src/middlewares/clerkProxyMiddleware.ts` — Clerk JWKS proxy

**Stripe setup** (do after connecting integration):
1. Update `src/stripeClient.ts` with template from `addIntegration()`
2. Run `pnpm --filter @workspace/scripts run seed-products` to create Silver + Gold products
3. Register Stripe webhook in the Stripe dashboard pointing to `/api/stripe/webhook`

### `artifacts/landing` (`@workspace/landing`)

SharpTracker marketing landing page.

- **Auth**: `@clerk/react` ClerkProvider with Wouter-based routing
- **Routes**: `/sign-in`, `/sign-up` (Clerk components), `/pricing` (PricingPage), `/why`, `/features/*`, `/legal/*`
- **Key files**:
  - `src/App.tsx` — ClerkProvider, NavUserMenu, all routes
  - `src/PricingPage.tsx` — pricing cards, fetches `/api/stripe/products`, checkout handler
- **Env vars**: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL`
- **API base**: `https://84e61830-7611-4d35-8623-77d057b02e4e-00-30ovvqhxka0d5.kirk.replit.dev` (hardcoded in App.tsx + PricingPage.tsx)

### `artifacts/odds-dropper` (`@workspace/odds-dropper`)

Main trading dashboard — gated behind Clerk auth.

- **Auth**: `@clerk/react` ClerkProvider + `AuthGate` component (redirects to `/landing/sign-in` if not signed in)
- **Key file**: `src/App.tsx` — ClerkProvider wraps all providers; AuthGate inside

### `lib/db` (`@workspace/db`)

Drizzle ORM. Schema: `users` table (public schema), Stripe tables live in `stripe` schema (managed by `stripe-replit-sync`).

- `src/schema/users.ts` — id (Clerk userId), email, stripe_customer_id, stripe_subscription_id, created_at
- Run `pnpm --filter @workspace/db run push` to sync schema changes
- **NEVER change ID column types** — destructive ALTER TABLE

### `scripts` (`@workspace/scripts`)

Utility scripts in `src/`. Run via `pnpm --filter @workspace/scripts run <script>`.

- `seed-products.ts` — creates Silver + Gold Stripe products and prices (run once after Stripe connection)

---

## Content & Writing Guidelines (Landing Page)

- **Simple English**: assume the reader has never bet before. Explain every term.
- **No specific bookmaker names** in body copy (Pinnacle, FanDuel, etc.) — only the logo marquee is exempt
- **Tone**: confident, factual, not hype-driven
- **Terminology**: "minimum drop" (not "threshold"), CLV = "did you get a better price?", ROI = "$X profit per $100 bet"
- **Color**: bg `240 5% 4%`, primary `186 100% 50%` (cyan), green `#4ade80`, red `#f87171`
