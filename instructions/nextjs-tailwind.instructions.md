---
description: 'Best practices for building Next.js (App Router) apps with modern caching, tooling, and server/client boundaries in mind. Updated for Next.js 16+.'
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js, **/*.css'
---

# Next.js Best Practices

## 1. Project Structure & Organization

- **Use the `src/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
  - `src/app/` — Routing, layouts, pages, and route handlers
  - `public/` — Static assets (images, fonts, etc.)
  - `src/lib/` — Shared utilities, API clients, and logic
  - `src/config/` — Configuration files and constants
  - `src/components/` — Reusable UI components
  - `src/features/` — Feature-specific components and logic (It is mandatory to use this folder when adding any new features.)
  - `src/store/` — Zustand state stores
  - `src/styles/` — Global and modular stylesheets
  - `src/hooks/` — Custom React hooks
  - `src/types/` — TypeScript type definitions
  - `src/utils/` — Miscellaneous utilities and helpers
- **Colocation:** Place files (components, styles, tests) near where they are used, but avoid deeply nested structures.
- **Route Groups:** Use parentheses (e.g., `(admin)`) to group routes without affecting the URL path.
- **Private Folders:** Prefix with `_` (e.g., `_internal`) to opt out of routing and signal implementation details.
- **Feature Folders:** For large apps, group by feature (e.g., `app/dashboard/`, `app/auth/`).
- **Use `src/`** (optional): Place all source code in `src/` to separate from config files.

## 2. Next.js 16+ App Router Best Practices

### 2.1. Server and Client Component Integration (App Router)

**Never use `next/dynamic` with `{ ssr: false }` inside a Server Component.** This is not supported and will cause a build/runtime error.

**Correct Approach:**

- If you need to use a Client Component (e.g., a component that uses hooks, browser APIs, or client-only libraries) inside a Server Component, you must:
  1. Move all client-only logic/UI into a dedicated Client Component (with `'use client'` at the top).
  2. Import and use that Client Component directly in the Server Component (no need for `next/dynamic`).
  3. If you need to compose multiple client-only elements (e.g., a navbar with a profile dropdown), create a single Client Component that contains all of them.

**Example:**

```tsx
// Server Component
import DashboardNavbar from '@/components/DashboardNavbar';

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Why:**

- Server Components cannot use client-only features or dynamic imports with SSR disabled.
- Client Components can be rendered inside Server Components, but not the other way around.

**Summary:**
Always move client-only UI into a Client Component and import it directly in your Server Component. Never use `next/dynamic` with `{ ssr: false }` in a Server Component.

### 2.2. Next.js 16+ async request APIs (App Router)

- **Assume request-bound data is async in Server Components and Route Handlers.** In Next.js 16, APIs like `cookies()`, `headers()`, and `draftMode()` are async in the App Router.
- **Be careful with route props:** `params` / `searchParams` may be Promises in Server Components. Prefer `await`ing them instead of treating them as plain objects.
- **Avoid dynamic rendering by accident:** Accessing request data (cookies/headers/searchParams) opts the route into dynamic behavior. Read them intentionally and isolate dynamic parts behind `Suspense` boundaries when appropriate.

---

## 3. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.tsx`).
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
  - Name context providers as `XyzProvider` (e.g., `ThemeProvider`).
- **File Naming:**
  - Match the component name to the file name.
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - No testing framework is pre-installed in this template. Add Jest, React Testing Library, or Playwright when needed, following the official Next.js testing docs.

## 4. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `kebab-case` (e.g., `api-client.ts`)
- **Variables/Functions:** `camelCase` (e.g., `getUserById`)
- **Types/Interfaces:** `PascalCase` (e.g., `UserProfile`)
- **Constants:** `SCREAMING_SNAKE_CASE` for module-level constants (e.g., `MAX_RETRY_COUNT`), `camelCase` otherwise

## 5. API Routes (Route Handlers)

- **Prefer API Routes over Edge Functions** unless you need ultra-low latency or geographic distribution.
- **Location:** Place API routes in `app/api/` (e.g., `app/api/users/route.ts`).
- **HTTP Methods:** Export async functions named after HTTP verbs (`GET`, `POST`, etc.).
- **Request/Response:** Use the Web `Request` and `Response` APIs. Use `NextRequest`/`NextResponse` for advanced features.
- **Dynamic Segments:** Use `[param]` for dynamic API routes (e.g., `app/api/users/[id]/route.ts`).
- **Validation:** Always validate and sanitize input. Use libraries like `zod` or `yup`.
- **Error Handling:** Return appropriate HTTP status codes and error messages.
- **Authentication:** Protect sensitive routes using middleware or server-side session checks.

### Route Handler usage note (performance)

- **Do not call your own Route Handlers from Server Components** (e.g., `fetch('/api/...')`) just to reuse logic. Prefer extracting shared logic into modules (e.g., `lib/`) and calling it directly to avoid extra server hops.

## 6. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **ESLint & Prettier:** Enforce code style and linting. Use the official Next.js ESLint config. In Next.js 16, prefer running ESLint via the ESLint CLI (not `next lint`).
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
  - In Next.js 16, `serverRuntimeConfig` / `publicRuntimeConfig` are removed. Use environment variables instead.
  - `NEXT_PUBLIC_` variables are **inlined at build time** (changing them after build won’t affect a deployed build).
  - If you truly need runtime evaluation of env in a dynamic context, follow Next.js guidance (e.g., call `connection()` before reading `process.env`).
- **Testing:** No testing framework is pre-installed. Add one when the project requires it, following official Next.js testing docs.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Prefer **Cache Components** (`cacheComponents` + `use cache`) over legacy caching patterns.
  - Use Suspense and loading states for async data.
  - Avoid large client bundles; keep most logic in Server Components.
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
  - Prefer server-side authorization for Server Actions and Route Handlers; never trust client input.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

## 7. Caching & Revalidation (Next.js 16 Cache Components)

- **Prefer Cache Components for memoization/caching** in the App Router.
  - Enable in `next.config.*` via `cacheComponents: true`.
  - Use the **`use cache` directive** to opt a component/function into caching.
- **Use cache tagging and lifetimes intentionally:**
  - Use `cacheTag(...)` to associate cached results with tags.
  - Use `cacheLife(...)` to control cache lifetime (presets or configured profiles).
- **Revalidation guidance:**
  - Prefer `revalidateTag(tag, 'max')` (stale-while-revalidate) for most cases.
  - The single-argument form `revalidateTag(tag)` is legacy/deprecated.
  - Use `updateTag(...)` inside **Server Actions** when you need “read-your-writes” / immediate consistency.
- **Avoid `unstable_cache`** for new code; treat it as legacy and migrate toward Cache Components.

## 8. Tooling updates (Next.js 16)

- **Turbopack is the default dev bundler.** Configure via the top-level `turbopack` field in `next.config.*` (do not use the removed `experimental.turbo`).
- **Typed routes are stable** via `typedRoutes` (TypeScript required).

## 9. Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

## 10. Always Use the Latest Documentation and Guides

- For every Next.js related request, begin by searching for the most up-to-date Next.js documentation, guides, and examples.
- Use the following tools to fetch and search documentation if they are available:

  - `resolve_library_id` to resolve the package/library name in the docs.
  - `get_library_docs` for up-to-date documentation.

- Use Tailwind CSS 4 patterns only; prefer utility classes and the existing `@tailwindcss/postcss` setup.
- Prefer CSS custom properties for theme colors and design tokens; avoid hardcoded color values when a token exists.
- Use `cn()` from `@/lib/utils` for conditional class merging.
- Keep `className` on reusable components and pass it through the final `cn()` call.
- Use `class-variance-authority` for variant-based UI components.
- Prefer semantic `data-slot` attributes for component sub-elements when the component already follows that pattern.
- Use responsive utility prefixes for breakpoint-specific styling.
- Prefer `focus-visible:` states and validation-friendly `aria-invalid:` styles for interactive elements.
- Keep SVG sizing consistent with the existing utility patterns in the codebase.
- Let Prettier handle Tailwind class ordering; do not manually reformat class lists for ordering only.

## 11. Project-Specific Stack

This app is a self-contained analytics dashboard — no external API, no
real database. Mock data lives in `src/data/*.json` and is served through
this app's own Next.js Route Handlers under `src/app/api/`. Always reach
for these instead of introducing alternatives.

| Area                         | Library / Location                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Mock dataset + Route Handlers | `src/data/*.json`, `src/app/api/**/route.ts`, server helpers in `src/lib/server/`                                       |
| HTTP client                  | `axios` — shared instance + interceptors in `src/lib/api-setting/` (bearer token attach, `401` handling), no `baseURL` needed since routes are same-origin |
| Server state / data fetching | `@tanstack/react-query` — client + provider in `src/lib/api-setting/`                                                    |
| Charts                       | `recharts`, via `src/components/ui/chart.tsx` (shadcn-style wrapper — see `context/architecture.md` for why it was hand-added) |
| Session (mock token + user)  | `zustand` (persisted) — lives in `src/features/auth/`. There is **no `middleware.ts`**; gating is client-side in `src/app/(protected)/layout.tsx`. |
| Forms & validation           | `react-hook-form` + `zod` + `@hookform/resolvers`                                                                        |
| UI components                | shadcn/ui (Radix UI base) — components in `src/components/ui/`                                                           |
| Icons                        | `lucide-react`, `@tabler/icons-react`                                                                                    |
| Animations                   | `motion` (Framer Motion), `tailwindcss-animate`                                                                          |
