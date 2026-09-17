# Architecture

## Stack

| Layer           | Technology                              | Notes                                                          |
| --------------- | --------------------------------------- | -------------------------------------------------------------- |
| Framework       | Next.js 16 + React 19 + TypeScript 5    | App Router, strict mode                                        |
| Styling         | Tailwind CSS 4 + shadcn/ui + Radix UI   | Components in `src/components/ui/`                             |
| Server state    | React Query 5 (`@tanstack/react-query`) | All fetching against the external chat API                     |
| Client state    | Zustand 5                               | Session store (JWT + user) in `src/features/auth/`             |
| Forms           | React Hook Form 7 + Zod 4               | `@hookform/resolvers`                                          |
| HTTP client     | Axios                                   | `src/lib/api-setting/` — bearer token attached via interceptor |
| Real-time       | Socket.IO client                        | Listens for `message:new` on the external API's host           |
| Icons           | Lucide React + Tabler Icons             |                                                                |
| Package manager | pnpm 10                                 | Node 22                                                        |

There is no database, ORM, or backend of our own. This app is a pure
frontend that talks directly to the external hosted chat API at
`https://frontend-task-chatapp.onrender.com/api` (see `context/env-reference.md`).

## Folder Ownership

| Folder               | What lives here                                                  |
| -------------------- | ---------------------------------------------------------------- |
| `src/app/`           | Routing, layouts, pages                                          |
| `src/features/`      | Feature modules — all new features go here (`auth`, `chat`, ...) |
| `src/lib/`           | Shared logic, API client setup, utilities                        |
| `src/components/`    | Shared UI components (not feature-specific)                      |
| `src/components/ui/` | shadcn/ui components — managed by CLI, do not edit manually      |
| `src/store/`         | Cross-feature Zustand stores, if any                             |
| `src/hooks/`         | Custom React hooks                                               |
| `src/types/`         | Global TypeScript type definitions                               |
| `src/config/`        | App-level configuration (`env.ts` — API base URL)                |
| `src/utils/`         | Misc utility functions                                           |

## Key File Locations

| Concern                                             | File                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| API base URL / Socket.IO origin                     | `src/config/env.ts`                                              |
| Axios instance + interceptors                       | `src/lib/api-setting/axios.ts`                                   |
| React Query client/provider                         | `src/lib/api-setting/react-query.ts`, `react-query-provider.tsx` |
| Auth session store (JWT + user)                     | `src/features/auth/`                                             |
| Chat feature (conversations, messages, socket hook) | `src/features/chat/`                                             |

## Auth & Access Model

- Auth is a single call: `POST /auth/login` with `{ phone, name }` — the
  external API both registers (new phone) and logs in (existing phone),
  returning a JWT bearer token and the user record.
- The token is held client-side in a persisted Zustand store and attached to
  every request via the shared Axios instance's request interceptor.
- There are no server-side sessions, no cookies, no organizations/workspaces
  — every user's identity and permissions are whatever the external API
  says they are.
- A `401`/`INVALID_TOKEN` response clears the session and redirects to
  `/login`.

## State Model

All state is either:

1. Remote — the external API is the source of truth for users,
   conversations, and messages, cached via React Query.
2. Client-only — the current session (token + user) in a persisted Zustand
   store, and ephemeral UI state (open dialogs, scroll position) in
   component state.

There is no local persistence layer of our own (no database, no localStorage
beyond the session store).

## Invariants

1. Server Components are the default — only add `use client` when browser
   APIs, hooks, or interactivity require it.
2. Validate all form input with Zod before submitting to the API.
3. The external API's base URL lives only in `src/config/env.ts` — never
   hardcode it elsewhere.
4. The bearer token is attached only through the shared Axios instance in
   `src/lib/api-setting/axios.ts` — never read the token store directly in
   feature code to set headers manually.
