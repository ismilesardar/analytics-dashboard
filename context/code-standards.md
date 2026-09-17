# Code Standards

## TypeScript

- Strict mode is required — `noImplicitAny`, `strictNullChecks`, etc.
- Never use `any` — use explicit interfaces or `unknown` with narrowing
- Validate unknown external input with Zod at form boundaries; infer types
  via `z.infer<typeof schema>`
- `PascalCase` for types/interfaces, `camelCase` for variables/functions,
  `kebab-case` for files and folders
- Constants: `SCREAMING_SNAKE_CASE` at module level, `camelCase` otherwise

## Next.js (App Router)

- Default to Server Components — add `'use client'` only when browser APIs,
  hooks, or interactivity require it
- Never use `next/dynamic` with `{ ssr: false }` inside a Server Component —
  wrap client-only logic in a `'use client'` component instead
- `cookies()`, `headers()`, `params`, `searchParams` are async in Next.js 16
  — always `await` them
- Route groups: use `(name)` to group without affecting the URL — `(protected)`
  wraps every authenticated route (`/`, `/orders`) behind one auth-gated layout
- There's no real database — Route Handlers under `src/app/api/` read/write
  the mock JSON dataset in `src/data/`. Client code calls these routes
  through the shared Axios instance, exactly as it would a real backend.

## Feature Organization

- Every new feature goes in `src/features/<feature-name>/`
- Shared logic across features goes in `src/lib/`
- Shared UI components (not feature-specific) go in `src/components/`
- Do not import between sibling feature folders — route through `src/lib/`
  or `src/components/`

## Data Fetching

- All client-side data fetching uses React Query — configured in
  `src/lib/api-setting/`
- All HTTP requests use the shared Axios instance in `src/lib/api-setting/`
  (bearer token attached via interceptor, `401` clears the session), calling
  this app's own `/api/...` Route Handlers with relative paths
- Route Handlers do their own filtering/sorting/pagination/date-bucketing
  server-side (see `src/lib/server/`) — don't re-implement that logic
  client-side; consume the already-shaped response

## Forms

- All forms use `react-hook-form` + Zod schema + `@hookform/resolvers/zod`
- Define the Zod schema alongside the form (in the feature's folder), infer
  the type, pass to `useForm<T>`

## Styling

- Tailwind CSS 4 only — no hardcoded hex values, use CSS custom property tokens
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- Class ordering managed by Prettier — do not manually reorder
- Responsive prefixes for breakpoints, `focus-visible:` for focus states,
  `aria-invalid:` for form errors

## Naming

| Thing                  | Convention                             |
| ---------------------- | -------------------------------------- |
| Files & folders        | `kebab-case`                           |
| Components             | `PascalCase` (filename matches export) |
| Hooks                  | `camelCase`, prefixed `use`            |
| Types/interfaces       | `PascalCase`                           |
| Variables/functions    | `camelCase`                            |
| Module-level constants | `SCREAMING_SNAKE_CASE`                 |

## Tooling

- Package manager: `pnpm` only
- Linting: ESLint 9 flat config (`eslint.config.mjs`) — run `pnpm lint` or
  `npx eslint src`
- Formatting: Prettier 3 — let it handle Tailwind class ordering
- Type check: `pnpm tsc --noEmit` — run before marking any task done
- Git hooks: Husky + lint-staged run on pre-commit automatically
