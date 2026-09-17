# Pulse — Production Analytics Dashboard

A SaaS analytics dashboard for a business managing customers, orders, and
system activity: revenue/orders/customer stat cards, revenue and orders
charts, recent orders and system activity, and a searchable/filterable/
paginated orders page with order detail — built for a frontend take-home
assignment.

This app is **self-contained**: there's no external API and no real
database. A mock JSON dataset is served through this app's own Next.js
Route Handlers, so it runs anywhere with zero environment configuration.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui + Radix UI
- **Charts:** Recharts, via a shadcn-style chart wrapper
- **Server state:** TanStack React Query (queries, pagination via `keepPreviousData`)
- **Client state:** Zustand (persisted session store)
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios (single shared instance, bearer-token interceptor)
- **Mock backend:** Next.js Route Handlers + a static JSON dataset
- **Package manager:** pnpm

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/login`. No `.env` file is needed; there are no environment variables to
configure.

**Seeded login:**

| Email             | Password    |
| ----------------- | ----------- |
| `admin@pulse.dev` | `admin1234` |

## Scripts

| Script              | What it does              |
| -------------------- | -------------------------- |
| `pnpm dev`          | Start the dev server      |
| `pnpm build`        | Production build          |
| `pnpm tsc --noEmit` | Type check                |
| `pnpm lint`         | Lint (ESLint flat config) |
| `pnpm format`       | Format with Prettier      |

## Project Structure

```
src/
  app/
    login/               /login — public sign-in page
    (protected)/         /  and  /orders — behind one client-side auth gate
      layout.tsx          auth gate + app shell (nav, theme toggle, logout)
      page.tsx            dashboard
      orders/page.tsx      orders
    api/                  Route Handlers — the mock backend
      auth/login/
      analytics/summary/
      analytics/charts/
      orders/, orders/[id]/
      activities/
  features/
    auth/                 session store, login form, API call
    dashboard/             stat cards, charts, recent orders/activity
    orders/                filters, table, pagination, order detail
  lib/
    api-setting/           shared Axios instance + React Query client
    server/                Route Handler helpers (dataset, pagination, date buckets, analytics, password hashing)
  data/                    the mock JSON dataset (customers, orders, activities, seeded user)
  components/
    ui/                    shadcn/ui primitives (not hand-edited)
    layout/                app shell, page shell/container, theme toggle
    order-status-badge.tsx shared status badge (used by dashboard + orders)
  types/order.ts           shared Order/OrderStatus types
```

See `context/architecture.md` for the full breakdown, invariants, and the
reasoning behind a few specific decisions (noted below too).

## Project Docs

- [`context/project-overview.md`](context/project-overview.md) — what this app does and its scope
- [`context/architecture.md`](context/architecture.md) — stack, folders, invariants
- [`context/ui-context.md`](context/ui-context.md) — theme, components, layout patterns
- [`context/env-reference.md`](context/env-reference.md) — environment variables (there are none) and the seeded login
- [`context/progress-tracker.md`](context/progress-tracker.md) — the build log, including the repurposing from an earlier chat-app project

---

## API / Data-Fetching Approach

Every screen fetches through a small, consistent layer:

1. **A mock dataset** (`src/data/*.json`) — 120 customers, 650 orders
   spanning the trailing 6 months, 200 system activities, and one seeded
   login user (password stored **hashed**, via Node's built-in `scrypt` —
   never plaintext, even in a mock).
2. **Next.js Route Handlers** (`src/app/api/**/route.ts`) read that dataset
   through typed helpers in `src/lib/server/` and do real server-side work:
   filtering, sorting, and pagination for `/api/orders`; date-range
   scoping and aggregation for `/api/analytics/summary`; and
   day/week-bucketed series for `/api/analytics/charts`. Responses use one
   consistent envelope (`{ data }`, or `{ data, meta }` when paginated) and
   error shape (`{ error: { code, message } }`).
3. **Feature `api.ts` modules** (`src/features/dashboard/api.ts`,
   `src/features/orders/api.ts`, `src/features/auth/api.ts`) call those
   routes through **one shared Axios instance**
   (`src/lib/api-setting/axios.ts`) — bearer token attached via a request
   interceptor, `401` responses clear the session and redirect to
   `/login`. Because the routes are same-origin, the instance needs no
   `baseURL` and no environment variable.
4. **React Query** owns all client-side caching, request dedup, and
   loading/error state — configured once in `src/lib/api-setting/`. UI
   components never call `fetch`/`axios` directly; they only see typed
   `useQuery`/`useMutation` hooks.

This keeps the three things the assignment asks to separate genuinely
separate: **API calls** (`api.ts`), **types** (`types.ts` per feature, plus
shared ones in `src/types/`), and **data transformation** (route handlers
+ `src/lib/server/analytics.ts`/`date-buckets.ts`) never leak into UI
components — a component only ever renders a `useQuery`'s `data`.

**Mock-data assumptions worth being explicit about** (since there's no
real backend to define these for us):

- **Total revenue** counts orders with status `delivered`, `shipped`, or
  `processing` — `pending` and `cancelled` are excluded as unconfirmed
  revenue.
- **Active customers** are those who placed an order in the trailing 90
  days (precomputed into the seed data).
- **Conversion rate** = active customers ÷ total customers. The more
  literal "orders ÷ customers" was tried first and produced over 500% on
  this dataset (customers place repeat orders) — clearly broken as a
  percentage stat card. This dataset has no visitor/session entity, so
  active-customer share is the closest bounded, plausible stand-in for a
  real orders/sessions conversion rate.

## Server vs. Client Components

All data fetching in this app is client-side (React Query + Axios) — there
is no server-side `fetch` inside a Server Component anywhere, which keeps
the boundary simple and consistent:

- **`src/app/(protected)/layout.tsx`** is a Client Component out of
  necessity — it reads a Zustand store backed by `localStorage`
  (`useAuthHasHydrated`/`useAuthStore`), which doesn't exist during server
  rendering. It waits for hydration, gives the restored token a brief
  grace window to settle, and redirects to `/login` if still absent.
- **Every route's `page.tsx`** (`/login`, `/`, `/orders`) stays a plain
  **Server Component** — no `'use client'`, no hooks, no data fetching. It
  does nothing but render that route's top-level client `*-view.tsx`
  component. This mirrors the one dynamic-route precedent already in this
  codebase's history (an async Server Component awaiting `params` and
  immediately delegating to a client component) — the same shape, just
  without a dynamic segment to await here.
- **`login-brand-panel.tsx`** is a Server Component — purely presentational,
  no interactivity.
- **Everything that fetches data or holds interactive state** — both
  dashboard panels, both charts, the orders filters/table/pagination/detail
  sheet, the login form — is a Client Component (`'use client'`), because
  React Query hooks and `useSearchParams`/`useRouter` require it.

In short: Server Components here are thin route shells and static panels;
Client Components are everything with a hook. That's a deliberate,
consistent split given the app's fully client-driven data-fetching
architecture — not a default applied without thought.

## Performance Decisions

- **`useMemo` was deliberately *not* used to reshape chart data.** The
  naive approach — fetch raw orders client-side, `useMemo` them into
  `{date, value}` series — was rejected in favor of doing that bucketing
  **server-side**, in `GET /api/analytics/charts`
  (`src/lib/server/date-buckets.ts`). The client receives chart-ready
  arrays and Recharts consumes them directly. The meaningful performance
  call here was avoiding the need for a client-side transform at all,
  not deciding how to memoize one.
- **`useCallback`** is used for stable references passed into memoized
  children: `src/features/orders/orders-table.tsx` wraps each row in
  `React.memo` (`OrderRow`), so the row's `onClick` handler is
  `useCallback`-wrapped in the parent to keep that memoization effective
  during pagination. `use-orders-filters.ts`'s setters (`setQuery`,
  `setStatus`, `setDateRange`, `setPage`) are also `useCallback`-wrapped
  since they're passed down into filter components.
- **Avoiding duplicate API calls** is handled by React Query's own
  caching, not bespoke code: the Orders page's full filter/pagination
  object is included in its `queryKey`
  (`src/features/orders/query-keys.ts`), so identical filter states are
  served from cache automatically, and `placeholderData: keepPreviousData`
  avoids a loading-skeleton flash when paginating. The dashboard's revenue
  and orders charts share one period selector and the same query key
  (`dashboardKeys.charts(period)`), so React Query dedups them into a
  single network request even though two components call `useQuery` with
  it independently. The order-detail query only runs when a `?orderId=`
  param is present (`enabled: !!orderId`).
- **`useEffect`** is used only where it's genuinely reacting to an
  external system: the auth gate's grace-window redirect (waiting on
  Zustand's hydration event before deciding whether to redirect), and the
  orders search box's debounce-to-URL sync. Filter/pagination state itself
  is never synced via an effect — it flows straight from the URL into
  `queryKey`/`queryFn`, which is the idiomatic React Query approach.
- **State management**: the Orders page's search/status/date/page state
  lives entirely in **URL search params**
  (`src/features/orders/use-orders-filters.ts`), not local component state
  or a dedicated store — this makes a filtered, paginated, detail-open
  view bookmarkable and correct on browser back/forward, and gives React
  Query's cache key a natural source of truth with no extra sync layer.
  Order detail is driven the same way (`?orderId=`), rendered as a `Sheet`
  rather than local dialog state, so it's independently deep-linkable.

## Issues Found and Fixed During Development

- **Conversion-rate formula produced >500%** on the seeded data (see
  above) — caught by actually looking at the rendered stat card rather
  than trusting the formula in the abstract; fixed by switching to a
  bounded active-customer-share formula.
- **The shadcn CLI (`npx shadcn@latest add chart`) fails on this project**
  — one of its transitive dependencies (`zod-to-json-schema`) tries to
  import a `zod/v3` subpath that doesn't exist under this project's zod
  v4, throwing `ERR_PACKAGE_PATH_NOT_EXPORTED`. Worked around by adding
  `recharts` directly and hand-writing `src/components/ui/chart.tsx` to
  match shadcn's official Charts component exactly.
- **Next.js's dev-mode indicator overlapped the app header.**
  `next.config.ts` had it pinned to `top-right` — the same corner as the
  header's theme toggle and logout button — so its portal intercepted
  clicks on them in dev mode. Moved to `bottom-right`. Caught via an
  automated browser click-through, not by inspection alone.

This project was repurposed from an earlier, unrelated take-home (a
real-time chat app) in the same repository — the login system and shared
Axios/React Query/shadcn infrastructure were kept and adapted; the chat
and landing-page features were removed entirely. See
`context/progress-tracker.md` for the full history.
