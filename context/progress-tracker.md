# Progress Tracker

> Update this file after every meaningful implementation change.

## Current Phase

Documentation — README + context files being brought in line with the
finished build.

## Current Goal

Finish the README (setup, architecture, API/data-fetching approach,
Server vs Client explanation, performance write-up) and do a final
end-to-end pass.

## Completed

- **Repurposed the repo from a chat-app take-home into this analytics
  dashboard**, deleting `src/features/chat/`, `src/features/landing/`,
  the old `/chat` routes and landing `page.tsx`, and the
  `socket.io-client`/`libphonenumber-js` dependencies.
- **Auth rework**: replaced phone+country-select login with email/password,
  validated against a local mock user (`src/data/users.json`, `scrypt`-hashed
  password, never plaintext or returned to the client) via
  `POST /api/auth/login`. Kept the existing Zustand persisted session store
  and Axios bearer-interceptor pattern, just retargeted the schema/route/
  redirect. `src/config/env.ts` was deleted outright — no env vars are
  needed now that all data comes from this app's own routes.
- **Mock dataset + Route Handlers**: seeded 120 customers, 650 orders
  (trailing 6 months), 200 system activities, and 1 login user into
  `src/data/*.json`; built six Route Handlers (`/api/auth/login`,
  `/api/analytics/summary`, `/api/analytics/charts`, `/api/orders`,
  `/api/orders/[id]`, `/api/activities`) with server-side filtering,
  sorting, pagination, and date-bucketing (`src/lib/server/`). Verified
  every endpoint manually via curl before building any UI against them.
  **Design decision made during this step**: the original conversion-rate
  formula (orders ÷ customers) produced 541% on the seeded data — obviously
  broken as a percentage stat card. Switched to active-customers ÷ total
  customers, which stays bounded 0–100% and reads as a plausible metric;
  documented as a mock-data approximation for a real orders/sessions ratio.
- **Protected route group**: `src/app/(protected)/layout.tsx` adapts the
  chat app's old auth-gating pattern (hydration check + 200ms grace-window
  redirect) to wrap both `/` and `/orders`, rendering a new
  `AppShell` (`src/components/layout/app-shell.tsx`) — a top nav with
  Dashboard/Orders links, theme toggle, and logout — instead of the old
  chat sidebar.
- **Dashboard feature** (`src/features/dashboard/`): 4 independently-loading
  stat cards, a revenue area chart + orders bar chart sharing one period
  selector (7d/30d/90d/6m — bucketing happens server-side, so no client
  `useMemo` is needed to reshape chart data), recent orders, recent system
  activity. Added `recharts` + a hand-written shadcn-style
  `src/components/ui/chart.tsx` (the shadcn CLI currently fails on this
  project's zod v4 — see `architecture.md`).
- **Orders feature** (`src/features/orders/`): search (debounced)/status/
  date-range filters and pagination driven entirely by URL search params
  (`use-orders-filters.ts`) so the query key derives straight from the URL
  and React Query dedups automatically; a plain HTML table with memoized
  rows; an order-detail `Sheet` opened via `?orderId=` so it's
  deep-linkable.
- **Verified end-to-end in-browser** (Playwright against a local Chrome):
  login with correct/incorrect credentials, dashboard renders real
  data/charts/tooltips at desktop and mobile widths, orders search/status
  filter/pagination/detail-sheet all round-trip through real `/api/orders`
  network requests, logout clears the session, and unauthenticated
  navigation to `/` or `/orders` redirects to `/login` — all with zero
  console/page errors.
- **Found and fixed a real bug during verification**: Next.js's dev-mode
  indicator was pinned to `top-right` in `next.config.ts` — the same
  corner as the app header's theme toggle/logout controls — and its
  portal was intercepting clicks on them. Moved to `bottom-right`.
- **Create-order flow added to the orders feature**: an "Add order" button
  in the `PageShell` actions slot opens a `CreateOrderSheet`
  (react-hook-form + Zod, matching the login form's pattern) with a
  customer `Select` (new `GET /api/customers`) and a `useFieldArray` of
  line items. Submits to a new `POST /api/orders` handler that validates
  the body, looks up the customer, computes `amount`/`id`/timestamps
  server-side, and `unshift`s onto the in-memory `orders` array from
  `dataset.ts` — consistent with how every other route in this app already
  works. **Not persisted to disk**: created orders live only for the
  process lifetime and are lost on restart/hot-reload, same as the rest of
  the mock dataset. Verified end-to-end in-browser (Playwright): picked a
  customer, added an item, submitted, got the "Order created" toast, and
  the new order appeared at the top of the table with the pagination count
  incremented — zero console errors.
- **Delete-order option added, scoped to user-created orders only**: since
  orders have no ownership/session concept (no `createdBy`, one seeded
  user), added an `isUserCreated?: boolean` flag on `Order`, set to `true`
  only by `POST /api/orders`. A new `DELETE /api/orders/[id]` handler
  404s on an unknown id and 403s if `isUserCreated` isn't set, otherwise
  splices the order out of the in-memory array. The orders table shows a
  delete icon only on rows where `isUserCreated` is true (seeded rows show
  none), guarded by a shadcn `AlertDialog` confirmation before calling the
  new `deleteOrder` client API — same `useMutation`/toast/query-invalidate
  pattern as order creation.
- **Fixed dashboard not reflecting order create/delete**: two separate
  bugs. (1) The create/delete mutations only invalidated the
  `['orders', 'list']` query key, which is not a prefix of the dashboard's
  `['orders', 'recent', 6]` key used by the Recent Orders card, so that
  card never refetched — widened both invalidations to the root keys
  `['orders']` and `['activities']`, covering every query under each. (2)
  `POST /api/orders` and `DELETE /api/orders/[id]` never wrote to the
  `activities` dataset, so the System Activity card had nothing new to
  fetch regardless of caching — both routes now `unshift` a matching
  `SystemActivity` (`order_created` / `order_cancelled`) onto the shared
  in-memory `activities` array from `dataset.ts`, same pattern as `orders`.
- **Added a status field to order creation**: `CreateOrderSheet` previously
  had no way to set an order's starting status — `POST /api/orders`
  hardcoded `status: 'pending'`. Added a `status` `Select` field (options
  from a new `ORDER_STATUS_OPTIONS` in `order-schema.ts`, defaulting to
  `pending`) between the customer picker and the line items, and the
  server schema/handler now validates and uses the submitted status
  instead of hardcoding it. Exported the existing `STATUS_LABELS` map from
  `order-status-badge.tsx` so the form reuses the same labels as the table
  badges instead of duplicating them.
- **Added status-change for user-created orders**: same `isUserCreated`
  scoping already used for delete. New `PATCH /api/orders/[id]` validates
  the submitted status, 404s if the order is missing, 403s if it isn't
  user-created, otherwise updates `status`/`updatedAt` and logs an
  `order_status_changed` activity (mirrors the `order_created`/
  `order_cancelled` activity writes added earlier). In the orders table,
  user-created rows now render an inline `Select` (stopping click
  propagation so it doesn't open the detail sheet) instead of the static
  `OrderStatusBadge`; seeded rows are unaffected. Wired through a new
  `statusMutation` in `OrdersView` with the same toast/invalidate pattern
  as create/delete.

## In Progress

- README write-up (setup, architecture, API approach, Server/Client
  explanation, performance decisions).

## Next Up

- Final full read-through of the README against the assignment's
  submission checklist.

## Open Questions

None currently — the mock-data assumptions (conversion rate formula,
revenue-eligible order statuses, "active customer" window) are documented
in `architecture.md` and the README rather than left open.

## Architecture Decisions

| Decision                                                               | Reason                                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Mock data served through real Next.js Route Handlers, not in-memory client filtering | Exercises a genuine API-service-layer pattern (real HTTP round trips, server-side filter/sort/paginate) rather than faking it client-side |
| Chart bucketing happens server-side (`/api/analytics/charts`)          | The client receives chart-ready arrays — no `useMemo` needed to reshape raw rows, which is the more meaningful performance decision than adding one |
| Orders filter/pagination/detail state lives in URL search params        | Makes a filtered/paginated/detail-open view bookmarkable and back-button-correct, and gives React Query's `queryKey` a natural source of truth with no extra sync layer |
| Conversion rate = active customers ÷ total customers, not orders ÷ customers | The literal formula produced >100% on repeat-purchase data; this version stays bounded and reads as a real metric, documented as a mock-data stand-in for orders/sessions |
| Seeded password is hashed (`scrypt`), never plaintext, even in a mock dataset | Security discipline shouldn't depend on whether the backend is "real" |

## Session Notes

This project was repurposed from a completed chat-app take-home
(conversations, Socket.IO, phone-based login) into this analytics
dashboard assignment. The login system, Axios/React Query infrastructure,
and shadcn/ui component set were kept and adapted; everything else was
rebuilt from the ground up against the new assignment brief.
