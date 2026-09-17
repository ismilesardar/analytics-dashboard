# UI Context

## Theme

Default shadcn "zinc" base theme, light/dark via `next-themes` (toggle in
`src/components/layout/ThemeToggle/`). The landing page (Part 2 of the
assignment) gets its own deliberate palette/typography direction on top of
this base — documented here once that design lands.

## Color Tokens

Defined as CSS custom properties in `src/app/globals.css` /
`src/app/theme.css` (shadcn's default token set — `--background`,
`--foreground`, `--primary`, `--muted`, `--border`, `--destructive`, etc.).
All components must use these tokens, no hardcoded hex values.

The landing page (`src/app/page.tsx`, `src/features/landing/`) and the
login page (`src/app/login/page.tsx`, `src/features/auth/login-brand-panel.tsx`)
are the one deliberate exception to the token rule above — they're
marketing/entry surfaces with their own palette, distinct from the app's
shadcn theme (per explicit design direction), using Tailwind's built-in
`indigo`/`orange`/`slate` palette directly rather than app-wide tokens.

This palette **is dark-mode aware**: every `slate`-family background/
border/text class is paired with a `dark:` class one or two steps darker/
lighter (e.g. `bg-white` → `dark:bg-slate-950`, `bg-slate-50` →
`dark:bg-slate-900`, `text-slate-900` → `dark:text-slate-50`,
`text-slate-500` → `dark:text-slate-400`, `border-slate-100` →
`dark:border-slate-800`) so these pages don't stay stuck light while the
rest of the app is dark. The bold gradient bands — the "How it works"
section, the final CTA band, and the login brand panel (all
indigo→orange/violet/rose gradients with white text) — are left
unchanged across themes on purpose: they're self-contained, high-contrast
color blocks that read fine in either theme without adaptation.

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
- Add new components via `pnpm dlx shadcn@latest add <component>` — never
  write them from scratch
- Use `cn()` from `src/lib/utils.ts` for all conditional class merging
- Use `class-variance-authority` for variant-based components

## Icons

- **Lucide React** (`lucide-react`) — primary icon set, stroke-based
- **Tabler Icons** (`@tabler/icons-react`) — supplemental (used by the theme
  toggle)
- Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons

## Layout Patterns

- **Chat app shell:** a conversation-list sidebar (built on
  `components/ui/sidebar.tsx`) alongside a message panel — the sidebar holds
  the conversation list + search/new-conversation entry point, the panel
  holds the open conversation's message history and composer.
- **New conversation / group creation:** shadcn `Dialog`, with `Command` for
  the user search/select list.
- **Mobile:** the sidebar collapses to an off-canvas `Sheet` (shadcn's
  sidebar component handles this out of the box).
- **Toasts:** `sonner` — use `toast()` for all notifications (failed sends,
  errors, etc).
- **Loading/empty/error states:** `Skeleton` for loading, and simple
  centered empty/error states with a retry action where relevant — see
  `src/components/layout/page-shell.tsx` for the established pattern.
