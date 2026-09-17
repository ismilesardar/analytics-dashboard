# UI Context

## Theme

Default shadcn "zinc" base theme, light/dark via `next-themes` (toggle in
`src/components/layout/ThemeToggle/`, mounted in the app header —
`src/components/layout/app-shell.tsx`). The login page keeps a deliberate
gradient brand panel exception (see below); everything else uses theme
tokens.

## Color Tokens

Defined as CSS custom properties in `src/app/globals.css` /
`src/app/theme.css` (shadcn's default token set — `--background`,
`--foreground`, `--primary`, `--muted`, `--border`, `--destructive`,
`--success`, `--warning`, `--info`, `--chart-1`..`--chart-5`, etc.). All
components must use these tokens, no hardcoded hex values.

- Order status badges (`src/components/order-status-badge.tsx`) map each
  status to a semantic token: `pending` → warning, `processing` → info,
  `shipped` → chart-4, `delivered` → success, `cancelled` → destructive.
- The revenue chart uses `--chart-1`, the orders chart uses `--chart-2` —
  set via the `ChartConfig` passed to `ChartContainer`, not hardcoded.

The login page (`src/app/login/page.tsx`,
`src/features/auth/login-brand-panel.tsx`) is the one deliberate exception
to the token rule — it's a marketing/entry surface with its own palette
(Tailwind's `indigo`/`orange`/`slate`), paired with `dark:` classes so it
still reads correctly in dark mode.

## Typography

| Role      | Font       | Variable       |
| --------- | ---------- | -------------- |
| UI text   | Inter      | `--font-inter` |
| Code/mono | Geist Mono | `--font-mono`  |

Configured in `src/lib/font.ts`.

## Border Radius

Using shadcn's default token-driven radius (`--radius`) — no custom overrides.

## Component Library

shadcn/ui on top of Tailwind CSS 4 + Radix UI primitives.

- Components live in `src/components/ui/`
- Add new components via `pnpm dlx shadcn@latest add <component>` when the
  CLI works for the component in question; `chart.tsx` was added by hand
  because the CLI currently fails on this project's zod v4 (see
  `architecture.md`) — treat it as CLI-managed anyway
- Use `cn()` from `src/lib/utils.ts` for all conditional class merging
- Use `class-variance-authority` for variant-based components
- No `table.tsx` primitive exists; the orders table
  (`src/features/orders/orders-table.tsx`) is a plain semantic `<table>`
  with Tailwind classes — add a shadcn table component instead of a second
  hand-rolled one if another table is ever needed

## Icons

- **Lucide React** (`lucide-react`) — primary icon set, stroke-based
- **Tabler Icons** (`@tabler/icons-react`) — supplemental (used by the
  theme toggle and `PageShell`'s built-in error/empty icons)
- Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons

## Layout Patterns

- **App shell:** a slim top nav (`src/components/layout/app-shell.tsx`,
  52px/`h-13` tall) with the brand mark, Dashboard/Orders links, theme
  toggle, and logout — rendered by the protected route group's layout
  (`src/app/(protected)/layout.tsx`) once the auth gate passes.
- **Page structure:** every page body is wrapped in
  `src/components/layout/page-shell.tsx` (title/description/actions
  header + built-in loading/error/empty slots) inside
  `page-container.tsx` (scrollable content area).
- **Dashboard panels:** 4 stat cards in a responsive grid, two charts
  side-by-side on large screens, recent orders + recent activity below —
  each panel is its own React Query consumer with independent
  loading/error states, not one page-level spinner.
- **Orders filters:** a responsive flex row (search input, status
  `Select`, two native `<input type="date">` fields) above the table.
- **Order detail:** a shadcn `Sheet` (`components/ui/sheet.tsx`), opened
  via a `?orderId=` URL param rather than local dialog state, so it's
  deep-linkable.
- **Mobile:** the app shell's nav stays visible (icons + labels wrap to
  icons-only if needed); dashboard grids and the filters row stack to a
  single column below the `sm`/`lg` breakpoints; the orders table scrolls
  horizontally within its own bordered container rather than the page.
- **Toasts:** `sonner` — use `toast()` for all notifications (failed
  logins, etc).
- **Loading/empty/error states:** `Skeleton` for loading, and simple
  centered empty/error states with a retry action where relevant — see
  `src/components/layout/page-shell.tsx` for the page-level pattern, and
  each dashboard panel / the orders list for the finer-grained,
  independently-loading version of the same pattern.
