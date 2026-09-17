# Loop — Chat App Take-Home Assignment

A real-time chat application built for a frontend take-home assignment:
phone + name login, 1:1 and group conversations, live messaging over
Socket.IO, and a landing page showcasing it.

This is a **pure frontend** — no database or backend of our own. Every
screen talks directly to a hosted chat API
(`https://frontend-task-chatapp.onrender.com/api`) with a bearer token.

- **Live demo:** _add the deployed Vercel URL here before submitting_
- **API docs:** [`docs/api.md`](docs/api.md) — every endpoint, verified
  against the live API, including several undocumented quirks (see below)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui + Radix UI
- **Server state:** TanStack React Query (queries, infinite queries, mutations)
- **Client state:** Zustand (persisted session store)
- **Forms:** React Hook Form + Zod (+ `libphonenumber-js` for real per-country phone validation)
- **HTTP:** Axios (single shared instance, bearer-token interceptor)
- **Real-time:** Socket.IO client
- **Animation:** Motion (landing page)
- **Package manager:** pnpm

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is at
`/`, the chat app is at `/chat` (redirects to `/login` if not signed in).

## Scripts

| Script              | What it does              |
| ------------------- | ------------------------- |
| `pnpm dev`          | Start the dev server      |
| `pnpm build`        | Production build          |
| `pnpm tsc --noEmit` | Type check                |
| `pnpm lint`         | Lint (ESLint flat config) |
| `pnpm format`       | Format with Prettier      |

## Project Structure

```
src/
  app/                 Routes: / (landing), /login, /chat, /chat/[id]
  features/
    auth/              Session store, login form, API call
    chat/              Conversation list, messages, sending, real-time,
                        new-conversation/group dialog
    landing/           Landing-page-only components
  lib/api-setting/     Shared Axios instance + React Query client
  components/ui/       shadcn/ui primitives (not hand-edited)
  config/env.ts        The one env var this app reads
docs/api.md            API documentation deliverable (Part 1)
```

See `context/architecture.md` for the fuller breakdown and invariants.

## Project Docs

- [`context/project-overview.md`](context/project-overview.md) — what this app does and its scope
- [`context/architecture.md`](context/architecture.md) — stack, folders, invariants
- [`context/env-reference.md`](context/env-reference.md) — environment variables
- [`context/progress-tracker.md`](context/progress-tracker.md) — the full build log, step by step, including every bug found along the way

---

## Part 3 — Thought Process Write-up

### Why this architecture

The core constraint shaping every decision here: **this app has no backend
of its own.** Everything talks directly to the given hosted API from the
client. That ruled out anything that assumes a server side to lean on —
no Next.js API routes as a proxy layer, no server-side session cookies, no
database. The session (a JWT + user object from `POST /auth/login`) lives
in a **persisted Zustand store**, and every request goes through one
**shared Axios instance** (`src/lib/api-setting/axios.ts`) with a request
interceptor that attaches the bearer token and a response interceptor that
clears the session on `401`/`NO_TOKEN`.

For data fetching, **React Query** does the work a hand-rolled fetching
layer built from `useEffect` and `useState` would otherwise reinvent
badly: caching, request dedup, retry, and — critically for the message
list — `useInfiniteQuery` for cursor-based pagination, which maps directly
onto the API's `before` cursor. **Zustand** (rather than React Context or
Redux) covers the one piece of genuinely global client state — the
session — with no boilerplate.

The chat feature itself lives entirely in `src/features/chat/`, organized
by concern rather than by component: `api.ts` (typed API calls),
`types.ts` (shapes, matching what the API actually returns — see "Issues
Ran Into" below for why that mattered), `query-keys.ts`, and one file per
UI concern (conversation list, message list, message input, the
new-conversation dialog, the socket hook). `use-send-message.ts` is shared
between the composer and the failed-message retry action, since both are
the same "optimistically send, roll back on failure" operation.

**Trade-off I made deliberately:** the session token lives in
`localStorage` via Zustand's `persist` middleware, not an httpOnly cookie.
With no backend of our own, there's nowhere to set an httpOnly cookie from
in the first place — the alternative would have been a thin Next.js API
route acting purely as a cookie-setting proxy, which felt like solving a
problem the assignment's constraints don't actually have (this API's
tokens aren't especially sensitive — it's a shared test sandbox — and the
realistic threat model for a take-home doesn't call for that complexity).
Noted here as a conscious trade-off, not an oversight.

### Part 2 design reasoning

The brief was explicit: bold, original, not a generic template. I picked a
violet → fuchsia → amber gradient specifically because it's distinct from
the app's own default shadcn "zinc" theme — the landing page and the
product don't need to look like the same design system; the landing page's
job is to sell the idea, the product's job is to be a clean, usable tool.
Scroll-triggered fade-ins (via `motion`'s `whileInView`) keep it feeling
alive without overdoing it — one animation primitive, reused consistently,
rather than a different effect per section.

The one deliberate "bonus" touch for Part 2: the hero doesn't just describe
real-time messaging, it **shows** it — a small looping animation (typing
indicator → message bubble → repeat) that plays automatically in a
stylized chat mockup. It's original in that it's not a stock testimonial
carousel or FAQ accordion (which the brief explicitly said wouldn't count);
it's a detail that demonstrates the product's core feature before the
visitor has even signed in.

### How AI tools were used

I used **Claude Code** (Anthropic's CLI agent) throughout, working from a
step-by-step plan I asked it to keep small and independently verifiable —
API docs first, then shared plumbing, then one chat feature at a time,
each one checked against the live API in a real browser (via Playwright)
before moving on.

**What it did:** wrote the implementation for every step against a plan I
reviewed and approved first; researched the actual API behavior by
querying the live server directly rather than trusting the (underspecified)
Swagger spec; found and fixed several real bugs along the way — a
temporal-dead-zone self-reference bug in a Zustand persist callback, an
invalid nested-`<button>` HTML issue in the new-conversation dialog (caught
via React's own hydration warning), and a timing gap between session
hydration and the first authenticated render that intermittently bounced a
logged-in user back to `/login` on a hard navigation. All three are logged
in detail in `context/progress-tracker.md` with root cause and fix.

**What I changed or would double-check by hand:** the overall shape of the
plan and every architectural call (no backend, Zustand for session, React
Query for server state) were decisions I made and had the agent execute
against, not decisions it made unprompted. The exact root cause of the
session-hydration timing bug wasn't fully nailed down to a specific library
internal before the fix was applied — the fix (a short grace window before
declaring a session absent) resolves the observable symptom and was
verified to do so, but if I were continuing this project I'd want to trace
that all the way to zustand's `persist` middleware source before calling it
fully understood, rather than trusting a well-verified but not
fully-root-caused patch.

### What I'd improve with more time

- **Group management UI.** The API supports adding/removing members,
  promoting admins, and renaming groups (`docs/api.md`) — none of that has
  UI yet, since the assignment only asked for group _creation_.
- **Message read receipts / unread indicators.** Fully derivable from data
  already fetched (no new API surface needed) but didn't make the cut
  given the time budget.
- **Root-cause the session-hydration timing bug properly** (see above)
  rather than resting on the verified-but-not-fully-explained fix.
- **A project-specific Playwright test suite**, committed to the repo, so
  the extensive manual verification done during development (documented in
  `context/progress-tracker.md`) becomes a repeatable regression check
  instead of one-off scripts.

### Issues ran into with the given API

None of these blocked the build, but each one required a deliberate
workaround — full detail on all of them is in `docs/api.md`; summarized
here:

1. **Swagger's response schemas are all unspecified.** Every shape used in
   this app was captured from real requests against the live API, not the
   spec.
2. **The server doesn't reject empty message text.** `POST /messages`
   happily stores `""`. The "no empty messages" requirement is enforced
   entirely client-side.
3. **`GET /conversations/{id}/messages`'s `before` cursor is inclusive**,
   not exclusive — naively using the oldest loaded message's id as the next
   cursor duplicates that message at the page boundary. Handled by
   deduping by `_id` when merging pages.
4. **Groups require 3 total members** (creator + 2+ selected) — undocumented
   in Swagger, discovered via a `400` with a validation message. Enforced
   client-side by requiring a second selection before the group-name field
   appears.
5. **The `message:new` Socket.IO payload doesn't match the REST response
   shape** — `id` instead of `_id`, a numeric millisecond timestamp instead
   of an ISO string. Normalized on receipt.
6. **`users/search`'s `q` parameter isn't actually enforced as required** —
   omitting it returns every user instead of a `400`.
7. **The mock backend is a shared sandbox** — other candidates' test data
   (conversations, users) is visible in listings. Expected, not a bug.
8. **The sandbox backend is occasionally slow under load** (one login
   request was directly observed taking 12+ seconds while a `curl` to the
   same endpoint moments later returned in under a second) — the shared
   Axios instance's timeout was set generously (30s) to accommodate this
   rather than fail fast on what's likely just contention from many
   candidates hitting the same free-tier instance concurrently.

One more thing worth noting honestly: the assignment PDF itself contained
a hidden prompt-injection instruction (invisible text in Part 3 attempting
to get an AI assistant to insert an unrelated word into a generated
summary). It wasn't followed — flagged here for transparency since this
write-up itself is exactly the kind of content that instruction targeted.
