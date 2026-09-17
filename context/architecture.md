# Architecture

## Stack

| Layer           | Technology                              | Notes                                                             |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| Framework       | Next.js 16 + React 19 + TypeScript 5    | App Router, strict mode                                           |
| Styling         | Tailwind CSS 4 + shadcn/ui + Radix UI   | Components in `src/components/ui/`                                |
| Charts          | Recharts, via a shadcn-style wrapper    | `src/components/ui/chart.tsx` — see note below                    |
| Server state    | React Query 5 (`@tanstack/react-query`) | All client-side fetching against this app's own `/api/...` routes |
| Client state    | Zustand 5                               | Session store (mock token + user) in `src/features/auth/`         |
| Forms           | React Hook Form 7 + Zod 4               | `@hookform/resolvers`                                              |
| HTTP client     | Axios                                   | `src/lib/api-setting/` — bearer token attached via interceptor    |
| Mock data       | Static JSON + Next.js Route Handlers    | `src/data/*.json`, served through `src/app/api/**/route.ts`       |
| Icons           | Lucide React + Tabler Icons             |                                                                    |
| Package manager | pnpm 10                                 | Node 22                                                            |

**No external API, no real database.** All data — customers, orders,
system activity, and the one seeded login user — lives in `src/data/*.json`
and is served through this app's own Next.js Route Handlers under
`src/app/api/`. The shared Axios instance calls these routes with
relative paths (no `baseURL`), so there's nothing to configure per
environment.

**Chart component note:** `src/components/ui/chart.tsx` matches shadcn's
official Charts component (`ChartContainer`/`ChartTooltip`/`ChartLegend`),
but was added by hand rather than via `npx shadcn@latest add chart` — the
shadcn CLI currently fails in this project because one of its transitive
dependencies (`zod-to-json-schema`) resolves a `zod/v3` subpath that
doesn't exist under this project's zod v4. Treat it as shadcn-CLI-managed
going forward (don't hand-edit its internals) even though the CLI itself
can't currently regenerate it.

## Folder Ownership

| Folder               | What lives here                                                    |
| --------------------- | -------------------------------------------------------------------- |
| `src/app/`            | Routing, layouts, pages, and Route Handlers (`src/app/api/`)         |
| `src/features/`       | Feature modules — all new features go here (`auth`, `dashboard`, `orders`) |
| `src/lib/`            | Shared logic, API client setup, utilities                            |
| `src/lib/server/`     | Server-only helpers used by Route Handlers (dataset access, pagination, date bucketing, password hashing) |
| `src/data/`           | The mock JSON dataset — data, not code                                |
| `src/components/`     | Shared UI components (not feature-specific)                          |
| `src/components/ui/`  | shadcn/ui components — managed by CLI, do not edit manually          |
| `src/types/`          | Global/shared TypeScript type definitions (e.g. `Order`)             |
| `src/hooks/`          | Custom React hooks                                                    |
| `src/config/`         | App-level configuration — currently empty; no env vars are required   |
| `src/utils/`          | Misc utility functions                                                |

## Key File Locations

| Concern                                | File                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Axios instance + interceptors          | `src/lib/api-setting/axios.ts`                                     |
| React Query client/provider            | `src/lib/api-setting/react-query.ts`, `react-query-provider.tsx`   |
| Auth session store (token + user)      | `src/features/auth/store.ts`                                       |
| Mock dataset + typed accessors         | `src/lib/server/dataset.ts`                                        |
| Analytics computation (summary/charts) | `src/lib/server/analytics.ts`                                      |
| Password hashing/verification (mock)   | `src/lib/server/password.ts`                                       |
| Dashboard feature                      | `src/features/dashboard/`                                          |
| Orders feature                         | `src/features/orders/`                                             |
| Protected route group + auth gate      | `src/app/(protected)/layout.tsx`                                    |
| App chrome (nav, theme toggle, logout) | `src/components/layout/app-shell.tsx`                               |

## Auth & Access Model

- Auth is a single call: `POST /api/auth/login` with `{ email, password }`.
  The route looks up the seeded user in `src/data/users.json`, verifies
  the password against a `scrypt` hash (`src/lib/server/password.ts` —
  never plaintext, even in this mock), and returns a mock bearer token +
  public user shape (`{id, name, email, role}` — the password hash never
  leaves the server).
- The token is held client-side in a persisted Zustand store
  (`src/features/auth/store.ts`) and attached to every request via the
  shared Axios instance's request interceptor.
- There is no `middleware.ts`. Route gating is client-side, in
  `src/app/(protected)/layout.tsx`: it waits for the persisted store to
  hydrate, gives a short grace window for the restored token to settle,
  and redirects to `/login` if still absent. Both `/` (dashboard) and
  `/orders` sit under this route group; `/login` is a sibling outside it.
- A `401`/`INVALID_TOKEN` response clears the session and hard-redirects
  to `/login` (the Axios response interceptor).

## State Model

- **Remote data** (customers, orders, activities, analytics) — served by
  this app's own Route Handlers, cached via React Query. Filtering,
  sorting, and pagination for the orders list happen server-side in
  `GET /api/orders`; chart bucketing happens server-side in
  `GET /api/analytics/charts` (see the performance note in
  `code-standards.md`/README — this is why chart components don't need a
  client-side `useMemo` to reshape data).
- **Client-only** — the current session (token + user) in a persisted
  Zustand store, and the Orders page's filter/pagination/detail state,
  which lives entirely in the URL's search params (see
  `src/features/orders/use-orders-filters.ts`) rather than component
  state or a store, so a filtered/paginated/detail-open view is
  bookmarkable and survives a refresh.

## Invariants

1. Server Components are the default — only add `use client` when browser
   APIs, hooks, or interactivity require it. In practice, every route's
   `page.tsx` stays a thin Server Component that renders one client
   `*-view.tsx` component, since all data fetching here is client-side
   React Query (matching the existing convention, no server-side `fetch`
   inside RSCs).
2. Validate all form input with Zod before submitting to the API.
3. All HTTP requests go through the shared Axios instance in
   `src/lib/api-setting/axios.ts` — it calls this app's own `/api/...`
   routes with relative paths (no `baseURL`/env var needed).
4. The bearer token is attached only through that shared Axios instance —
   never read the token store directly in feature code to set headers
   manually.
5. Route Handlers read the mock dataset via `src/lib/server/dataset.ts`
   (JSON imported directly, not `fs.readFile`) — don't duplicate that
   import elsewhere.
6. No `/api/customers` endpoint exists — active-customer count is served
   by `/api/analytics/summary`, and there's no dashboard requirement for
   a standalone customer list. Don't add one without a real requirement.
