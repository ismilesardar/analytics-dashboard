# Project Overview

## What

A production-style SaaS analytics dashboard built for a frontend take-home
assignment: revenue, orders, and customer metrics for a business managing
customers, orders, and system activity. The app is self-contained — a mock
JSON dataset is served through this app's own Next.js Route Handlers, so
there's no external API dependency and no real database.

## Goals

1. Implement every required flow from the assignment brief: a dashboard
   with top-line stats and charts, a searchable/filterable/paginated orders
   page with order detail, and loading/empty/error handling throughout.
2. Fetch all data through a proper API service layer — never hardcode data
   inside UI components — with API calls, types, and data transformation
   kept separate from the UI.
3. Use idiomatic Next.js App Router architecture: correct Server vs Client
   Component boundaries, sensible state management, and deliberate
   performance choices (`useMemo`/`useCallback` only where they earn their
   keep, no duplicated fetches).
4. Ship a clean, responsive UI.

## Core User Flow

1. User signs in with email + password (validated against a seeded mock
   user via `POST /api/auth/login`).
2. User lands on the dashboard: total revenue, total orders, active
   customers, and conversion rate stat cards; a revenue chart and an
   orders chart sharing one period selector (7d/30d/90d/6m); a recent
   orders list; a recent system activity feed.
3. User navigates to Orders: searches by order id or customer name,
   filters by status and date range, paginates through results, and opens
   an order's detail in a deep-linkable side sheet (`?orderId=`).
4. User logs out, clearing the session and returning to `/login`; any
   direct navigation to a protected route while logged out redirects back
   to `/login`.

## Features

### Auth

- Email + password login/logout, backed by one seeded mock user (hashed
  password, verified server-side — see `context/env-reference.md` and
  `context/architecture.md` for the exact mechanism)
- Session persistence (a mock bearer token) across reloads via a
  persisted Zustand store
- Client-side route gating for all protected routes (`/` and `/orders`)

### Dashboard

- Stat cards: total revenue, total orders, active customers, conversion
  rate — each fetched independently so one slow/failed panel doesn't
  block the others
- Revenue chart (area) and orders chart (bar), sharing one period
  selector, fed by data that's already bucketed server-side
- Recent orders list and recent system activity feed

### Orders

- Search (debounced), status filter, date-range filter, and pagination —
  all URL-search-param-driven, so a filtered/paginated view is
  bookmarkable and back-button-correct
- Order detail in a `Sheet`, opened via a `?orderId=` param so it's
  independently deep-linkable

### States

- Loading skeletons, empty states, and error-with-retry handled
  throughout (dashboard panels, orders list, order detail)

## Scope

**In:** Everything listed under Features above, built against this app's
own mock API and JSON dataset.

**Out:** Real authentication/authorization, a real database, customer
management UI, order editing/creation, and anything not required by the
assignment brief (see the task PDF for the full requirement list).

## Success Criteria

1. `pnpm tsc --noEmit` and `pnpm lint` pass with no errors.
2. All Core User Flow steps work end-to-end in a browser: login (including
   a rejected wrong-password attempt), dashboard stats/charts/recent data,
   orders search/filter/pagination/detail, logout, and gating on
   unauthenticated access to protected routes.
3. Responsive at both desktop and mobile viewport widths.
4. README includes setup instructions, architecture explanation, the
   API/data-fetching approach, the Server vs Client Component reasoning,
   and the performance-decisions write-up required by the assignment.
