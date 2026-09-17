# Progress Tracker

> Update this file after every meaningful implementation change.

## Current Phase

Step 13 of the build plan — deploy + final pass.

## Current Goal

Deploy to Vercel, set `NEXT_PUBLIC_API_BASE_URL`, and do a full manual
verification pass on the live URL before submission.

## Completed

- Made the chat section responsive, added loading spinners to action
  buttons, and gave first-time users a real "start chatting" button:
  - **Responsive layout** (`chat-shell.tsx`, `conversation-view.tsx`):
    the sidebar and conversation panel used to always render side by
    side with a fixed `w-80` sidebar — unusable on a narrow viewport.
    `chat-shell.tsx` uses `collapsible='none'` on the shadcn `Sidebar`,
    which bypasses its built-in off-canvas mobile `Sheet`, so mobile
    behavior had to be built directly: `usePathname()` now drives which
    panel shows below the `md:` breakpoint — `/chat` (no id) shows the
    full-width conversation list, `/chat/[id]` shows the full-width
    conversation view, never both — while `md:` and up keeps the
    original side-by-side layout unchanged. Added a `md:hidden` back
    button (`IconArrowLeft`) to `conversation-view.tsx`'s header so a
    mobile user can return to the list. Verified via Playwright at a
    390px viewport (list-only, then conversation-only after opening one,
    then list again after the back button) and at 1280px (unchanged
    side-by-side), no console errors.
  - **Spinners on pending actions**: the confirm button in
    `new-conversation-dialog.tsx` and the "Add members" button /
    per-row remove button in `group-settings-dialog.tsx` previously
    just went silently `disabled` while their mutation was in flight —
    added the existing `Spinner` component (already used for the
    dialogs' search-loading state) so each shows real loading feedback.
    The per-row remove button shows the spinner only on the specific
    row being removed (`removeMutation.variables === participant._id`),
    while all rows stay disabled during any in-flight removal to block
    a double-submit.
  - **First-chat CTA**: `conversation-list.tsx`'s empty state (zero
    conversations — a brand-new user's first login) was plain text with
    no action. Added a `Start a conversation` button there, wired to
    the same `NewConversationDialog` already used from the sidebar
    header.
- Made the landing page and login page dark-mode aware: both were
  previously a deliberate light-only exception to the token system
  (documented in `context/ui-context.md`), which meant visiting `/` or
  `/login` after switching to dark mode elsewhere in the app left them
  stuck pure white — reported as "color doesn't match the theme." Added
  paired `dark:` classes across every hardcoded `slate`-family
  background/border/text class in `src/app/page.tsx`, `src/app/login/page.tsx`,
  and every file in `src/features/landing/` except the bold gradient
  bands (`cta-band.tsx`, `how-it-works.tsx`) and `login-brand-panel.tsx`,
  which were deliberately left unchanged — they're self-contained
  indigo/orange/violet gradient blocks with white text that already read
  fine in either theme. `login-form.tsx`/`country-select.tsx` needed no
  changes, already built entirely from theme-token shadcn components.
  Updated `context/ui-context.md`'s landing-page palette note to describe
  the new dark-mode-aware behavior (was previously documented as
  intentionally theme-independent — that direction changed on explicit
  request). Verified in-browser with both themes forced via
  `localStorage.theme`: light mode is pixel-identical to before, dark
  mode reads correctly top-to-bottom on both pages (nav, hero, feature
  cards, product mockup, testimonials, footer, login form panel), no
  console errors.
- Consolidated add/remove members into one dialog: previously there were
  two separate entry points — an admin-only "add members" icon and a
  "members" text that opened a separate read-only list-with-remove
  dialog. Merged both into a single `group-settings-dialog.tsx`
  (`GroupSettingsDialog`, replacing `add-members-dialog.tsx` and
  `group-members-dialog.tsx`, both deleted) reached through one settings-
  gear icon (`IconSettings`) in `conversation-view.tsx`'s header, in the
  same spot the old "add members" icon occupied. The dialog always shows
  the member list; the add-by-search section only renders when the
  viewer is an admin (`useAuthStore` + `conversation.admins`), matching
  the backend's admins-only rule for both add and remove. The static
  "{n} members" line under the group name stays as plain text (no longer
  itself a dialog trigger, since the settings icon now covers that).
  Verified in-browser: settings icon opens the combined dialog, member
  list and admin-only add-search both work from the same modal, icon is
  absent entirely on direct (non-group) conversations, no console errors.
- Group member count/list + admin-only remove: the header only showed the
  group name, with no way to see how many members a group had, who they
  were, or to remove one. Added `removeParticipant()` to `api.ts`
  (`DELETE /conversations/{id}/participants/{userId}`, admins-only per
  `docs/api.md` — same situation as `addParticipants` earlier, backend
  already supported it). Added `group-members-dialog.tsx`: a read-only
  member list (avatar, name, phone, "Admin" badge from the previously-
  unused `@/components/ui/badge`) that also shows a per-row remove button
  when the viewer is an admin, wired to a mutation that invalidates
  `chatKeys.conversations` on success (same key every other conversation
  mutation in this feature already invalidates). `conversation-view.tsx`'s
  header now shows a clickable "{n} members" subtext under the group name
  that opens this dialog. Verified in-browser: member count and list are
  correct, admin badge shows on the right person, removing a member (a
  *different* member, not the admin's own row) live-updates both the
  dialog's title/count and the row list via the query invalidation, no
  console errors. **Confirmed a related edge case while testing**: an
  admin can also remove themselves this way (their own row has the same
  remove control), which correctly behaves as leaving the group — it
  disappears from their own conversation list — matching the backend's
  documented "except removing your own id" self-removal allowance; this
  wasn't specifically requested but falls out naturally from listing every
  participant's row identically rather than special-casing self.
- Add members to an existing group: the backend already supported this
  (`POST /conversations/{id}/participants`, admins-only, documented in
  `docs/api.md`) but it was never wired into the frontend — after creating
  a group there was no way to add anyone to it. Added `addParticipants()`
  to `api.ts`; added `add-members-dialog.tsx`, a near-duplicate of
  `new-conversation-dialog.tsx`'s search/select UI (deliberately not
  extracted into a shared abstraction — same search-and-checkbox-list
  pattern, but scoped to always-multi-select-add with no group-name field,
  and candidates additionally excluded if already in
  `conversation.participants`); wired an admin-gated "Add members" button
  (`IconUserPlus`) into `conversation-view.tsx`'s header, shown only when
  `conversation.type === 'group'` and the current user is in
  `conversation.admins`. Verified in-browser: created a group, confirmed
  the button appears only for that group's admin and not on a direct
  conversation, searched for and added a real user (`POST .../participants`
  returned `200`, dialog closed, conversation list refreshed via the
  existing `chatKeys.conversations` invalidation), no console errors.
- Chat UI redesign — modernized `src/features/chat/`: mounted the existing
  but previously-unused `ModeToggle` (`src/components/layout/ThemeToggle/theme-toggle.tsx`)
  in the sidebar header so theme can be switched from inside the chat
  section; added a WhatsApp-style faint dot-pattern wallpaper behind the
  message thread (`.chat-wallpaper` in `globals.css`, a light/dark SVG
  data-URI pair — the one deliberate hardcoded-hex exception since it's a
  decorative texture, not a design token) applied consistently across the
  message list's skeleton/error/empty/populated states; gave the sidebar a
  brand-tinted gradient (`bg-(--brand-color)`, the same token the submit
  button already uses) plus a colored user avatar, and gave each
  conversation row a deterministic per-contact avatar color (hashed into
  the existing `--chart-1`..`--chart-5` tokens) with an orange left-border
  indicator on the active row. Message bubbles now use two distinct light
  tints instead of a solid-vs-flat scheme: "mine" is a light amber tint
  (`bg-(--brand-color)/15`, same brand token as the sidebar/submit button)
  and "other" is a light blue tint (`bg-info/12`, the existing `--info`
  token), both with a matching subtle border and `text-foreground` for
  contrast in both themes. Verified in-browser via a real login +
  Playwright screenshots in both light and dark mode — no console errors,
  wallpaper and bubble colors switch correctly with the theme toggle's
  view-transition animation.
  **Real layout bug found and fixed**: the sidebar's right border/gradient
  only extended as far as its own content (e.g. ~330px in a 900px
  viewport when few conversations existed) instead of the full page
  height — and conversely, with a long conversation/message list the
  entire page grew taller than the viewport and scrolled as one block
  instead of just the inner panels. Root cause: `SidebarProvider`'s
  wrapper only had `min-h-svh` (a floor, not a fixed height), so the
  `Sidebar`'s `h-full` and `SidebarInset`'s `flex-1` had no stable
  cross-axis size to stretch to — the row's height was driven by
  whichever panel's content happened to be taller. Fixed by pinning
  `<SidebarProvider className='h-svh'>` in `chat-shell.tsx` (an allowed
  className override, no edit to `src/components/ui/sidebar.tsx`), and
  switching `conversation-view.tsx` and `chat/page.tsx`'s outer wrappers
  from `h-svh`/`min-h-svh` to `h-full` to match the now-fixed-height
  ancestor. Verified via Playwright bounding-box measurements: sidebar
  height now exactly equals `window.innerHeight` both with zero
  conversations open and with a long list/message thread loaded, with
  scrolling correctly confined to the conversation list and message
  thread panels instead of the whole page.
- Real per-country phone validation, replacing the regex-based check: added
  `libphonenumber-js` and a searchable `CountrySelect` combobox
  (`src/features/auth/country-select.tsx` — flag emoji + calling code per
  country, powered by `getCountries()`/`getCountryCallingCode()` and
  `Intl.DisplayNames` for names, no extra dependency needed for that part).
  `login-schema.ts` now cross-validates `{phone, country}` via
  `isValidPhoneNumber` from the library (real numbering-plan rules, not
  just digit counting). On submit, the national number + country combine
  into a proper E.164 string via `parsePhoneNumberFromString(...).number`
  before being sent to the API.
  **Real bug found and fixed during verification**: switching the country
  after already typing a phone number left a stale validation state — the
  Continue button stayed enabled even though the number no longer matched
  the newly-selected country, because react-hook-form's `onChange` mode
  only revalidates the field that fired the change event, and cross-field
  zod `.refine()` errors don't automatically get attached to a sibling
  field on an unrelated change. Fixed by explicitly calling
  `form.trigger('phone')` when the country selection changes. Verified
  with a phone number chosen to be structurally valid for one country and
  invalid for another (confirmed via direct `isValidPhoneNumber` calls,
  since some digit strings are coincidentally valid-shaped for multiple
  countries) — switching country now immediately disables the button and
  shows the error, no stale state.
- Login form validation made live: `login-form.tsx`'s `useForm` now runs
  in `mode: 'onChange'` (react-hook-form defaulted to validate only on
  submit), so a phone number's format error appears as the user types,
  not after clicking Continue. The submit button is also now disabled
  while `!form.formState.isValid` (in addition to the existing
  `mutation.isPending` check) — the user literally cannot submit until
  both fields pass validation, matching the explicit "without validation,
  you won't be able to login" requirement. Verified in-browser: button
  starts disabled on an empty form, typing an invalid phone shows the
  error immediately (no submit click) and keeps the button disabled,
  fixing it live clears the error and enables the button.
- Login page redesign — split layout: a colorful branded left panel
  (`src/features/auth/login-brand-panel.tsx`, reusing the landing page's
  indigo→orange palette, a small static message-bubble illustration, and
  a `Link` back to `/`) hidden on mobile, with the sign-in form on the
  right against a soft slate background instead of the old bare centered
  card. On mobile the brand mark still appears (linking home) above the
  form. **Real gap fixed**: `login-schema.ts`'s phone field previously
  only checked string length (6–20 characters) — a value like `"abcdef"`
  would have passed. Replaced with real format validation (optional
  leading `+`, digits with space/dash/paren separators allowed, digit
  count checked against the practical 7–15 E.164 range). Verified
  in-browser: an invalid value shows the error, a realistic phone number
  doesn't, both breakpoints render correctly, and the logo link navigates
  to `/`.
- Landing page: added `HappyUsers` (`src/features/landing/happy-users.tsx`)
  — a testimonial section with star ratings and gradient-initial avatars,
  slotted between the product showcase and the final CTA band — and
  redesigned `SiteFooter` with a real multi-column layout (brand + tagline,
  two link groups pointing at working destinations: in-page section
  anchors for Features/How it works, and Home/Sign in routes — no dead
  placeholder links), a divider, and the copyright line. Added `id`
  anchors + `scroll-mt-16` to the `FeaturesGrid` and `HowItWorks` sections
  so the new footer links actually scroll to them correctly under the
  sticky nav. Verified in-browser (screenshots), no console errors.
- Landing page redesign (revisiting Step 11) — first pass (a single dark
  violet/fuchsia gradient page) was rejected on explicit feedback: too dark
  and uniform, wanted a lighter, multi-section, more broadly-appealing
  "modern" feel. Rebuilt as a light-first, 6-section page:
  `SiteNav` → `Hero` (white bg, gradient-text accent, reused/re-skinned
  animated chat mockup) → `FeaturesGrid` (white bg, icon cards) →
  `HowItWorks` (indigo→violet gradient band, 3 numbered steps — deliberate
  color contrast against the white sections around it) → `ProductShowcase`
  (white bg, a larger static browser-chrome-framed mockup of the actual
  sidebar+conversation UI) → `CtaBand` (orange→rose→indigo gradient band)
  → `SiteFooter`. Kept `page.tsx` as a thin composer, per the project's
  established `src/app/` (routing) vs `src/features/<name>/` (UI/logic)
  split — same pattern as `features/auth` and `features/chat`, now also
  `features/landing`. Verified via Playwright screenshots at 1280px and
  390px after scrolling the full page (to trigger every `whileInView`
  animation, not just what's in the first viewport) — clean at both
  breakpoints, no console errors. Updated `context/ui-context.md` to
  document the landing page's own light-first palette as a deliberate,
  documented exception to the app's shadcn theme tokens.
- Step 12: README Part 3 write-up filled in — architecture/library
  trade-offs (no backend of our own, why React Query + Zustand, the
  localStorage-vs-httpOnly-cookie trade-off made explicit), Part 2 design
  reasoning, honest AI tool usage disclosure (what Claude Code did, what
  was reviewed/directed by the user, and the one thing — the
  session-hydration bug's exact root cause — flagged as verified-fixed but
  not fully traced to a library internal), a "what I'd improve" list, and
  the full "Issues Ran Into" summary pulling from every quirk logged in
  this file and `docs/api.md`. Also disclosed the PDF's hidden
  prompt-injection attempt for transparency.

- Step 11: landing page (`src/app/page.tsx`, `src/features/landing/`) — a
  bold violet/fuchsia/amber gradient design (deliberately distinct from the
  app's default shadcn theme, per `ui-context.md`'s note that Step 11 owns
  its own palette), scroll-triggered fade-in sections via `motion`,
  responsive down to a 390px mobile viewport (verified via screenshots at
  both 1280px and 390px widths — no console errors). The landing-page bonus
  touch: `hero-chat-mockup.tsx`, a small self-contained looping animation —
  a typing indicator followed by a message bubble, cycling through a short
  scripted exchange — that demonstrates the product's real-time nature
  directly in the hero rather than describing it, without any of the
  generic patterns the assignment explicitly said not to lean on
  (testimonials, FAQ accordion).
- Step 10 (bonus): completed the failed-message recovery path — extracted
  the send mutation into a shared `use-send-message.ts` hook (used by both
  the composer and a new tap-to-retry action on failed bubbles in
  `message-list.tsx`), so a message that fails to send isn't a dead end —
  the user can retry it in place with the same optimistic/pending/confirmed
  flow, not just see a static "failed" label. This closes a real gap from
  Step 6 (a "failed" status with no recourse isn't a complete
  implementation of that state) and doubles as the assignment's requested
  "one step further" addition.
  **Verification note — environment constraint, not a code issue:** browser
  end-to-end verification of this specific flow was cut short after
  discovering the sandbox environment is under severe memory pressure
  (`free -h` showed ~14GB/15GB used, 5.6GB actively swapping, driven by the
  broader desktop environment — VS Code, the user's browser, language
  servers — not by this project's dev server, which stayed lightweight
  throughout). That pressure was intermittently starving Playwright's
  headless Chromium and even plain network requests, producing misleading
  timeouts (traced one login stall directly to a 12s+ request completion
  time despite the live API itself responding in <1s via a bare `curl` at
  the same moment). Rather than keep burning time and further loading an
  already-strained environment, this was resolved by code review: the retry
  path reuses the exact same `onMutate`/`onError`/`onSuccess` mutation
  logic already exercised successfully end-to-end multiple times in Step 6
  (optimistic add → real failure → status flip was directly observed via
  route interception before the environment degraded further); the only
  new code is the retry button's `onClick`, which re-invokes that same
  proven mutation with the existing message's id. Also bumped the shared
  Axios timeout from 15s to 30s as a legitimate hardening — the live API
  has been observed to occasionally take 10s+ under load, and 15s was
  cutting it close.
- Step 9: `src/features/chat/new-conversation-dialog.tsx` — debounced
  `GET /users/search`, multi-select (search results filter out the current
  user), direct-conversation start via `POST /conversations` for a single
  selection, group creation via `POST /conversations/group` for 2+
  selections (matching the API's 3-total-member minimum from `docs/api.md`,
  enforced client-side by requiring a group name once 2+ are selected),
  navigates into the new conversation on success. Wired into the sidebar's
  header as the functional "new conversation" button (previously a
  placeholder removed in Step 4).
  **Real bug found and fixed via React's own hydration warning**: the
  selectable user rows were `<button>` elements each containing a shadcn
  `Checkbox` — which itself renders as a `<button role="checkbox">` —
  producing invalid nested-button HTML that broke click handling
  unpredictably. Fixed by using a `<div role="button" tabIndex={0}>` row
  with the checkbox set `pointer-events-none` (purely visual, the row
  owns the click/keyboard handling). Verified in-browser end-to-end: a
  direct conversation started via search, and a group created with 2
  real selected participants correctly required a group name, created via
  the API, and navigated into a genuinely new conversation id.
  placeholder removed in Step 4).
- Step 8: refined `message-list.tsx`'s auto-scroll — a single consolidated
  effect now: scrolls to bottom on initial load and on the current user's
  own sent messages (unchanged from Step 6), and for _incoming_ messages
  only scrolls if the user is already near the bottom (tracked via a
  scroll-position ref); otherwise leaves their position alone and shows a
  "New message(s)" pill that scrolls to bottom on click. Pagination
  (scroll-up loads) is naturally excluded since it changes `messages.length`
  without changing the last message's id. Verified in-browser with two real
  sessions in a group with real history: scrolled up mid-history, had the
  other session send a message, confirmed (via screenshot) the view stayed
  put with the pill showing, and clicking it revealed the new message.
- Step 7: real-time (`src/features/chat/use-chat-socket.ts`) — connected
  once at the `ChatShell` level for the whole session, listens for
  `message:new`, merges into both the open conversation's message cache and
  the sidebar's conversation list (bumping `lastMessage`/`updatedAt`), with
  dedup against the sender's own optimistic message. **Found and documented
  another real API quirk before writing this**: the `message:new` socket
  payload doesn't match the REST response shape — `id` instead of `_id`,
  and a numeric millisecond timestamp instead of an ISO string — normalized
  on receipt; see `docs/api.md`. Also hardened the optimistic-send success
  handler against the socket delivering the sender's own message before the
  REST response resolves (drops the temp placeholder instead of
  duplicating). Verified with two real, separately-logged-in Playwright
  sessions in the same conversation: a message sent by one appears in the
  other with no refresh, and the second session's sidebar list live-updates
  its preview/order too.
- Step 6: sending messages (`src/features/chat/message-input.tsx`) —
  client-side empty/whitespace guard (server itself doesn't reject empty
  text, per `docs/api.md`), optimistic append with a `sending` → confirmed
  status transition, failed-send marking, Enter-to-send, disabled while a
  send is in-flight. Verified in-browser end-to-end against the live API:
  empty send blocked (button disabled + Enter no-ops), a real message
  appears instantly and resolves to a confirmed timestamp, conversation
  list invalidated on success so the preview stays in sync.
- Step 5: message history view (`src/app/chat/[id]/page.tsx` as an async
  Server Component awaiting `params`, delegating to the client
  `ConversationView`/`MessageList`), `before`-cursor pagination via
  `useInfiniteQuery`, deduped by `_id` (the API's inclusive cursor
  overlaps pages by one message — verified: two 30-message pages produced
  exactly 59 rendered bubbles). Sender/receiver bubble styling, timestamps,
  auto-scroll-to-bottom on load, loading/empty/error states.
  **One significant bug found and fixed:** navigating via a hard browser
  navigation (not a client-side `Link`/`router.push`) straight into any
  `/chat/*` route right after logging in intermittently redirected back to
  `/login`, even though the session was genuinely persisted and valid. Root
  cause: a real, reproducible timing gap between zustand persist's
  `hasHydrated()` flag flipping true and the restored `token` value being
  visible to the very first post-hydration React render — the auth guard's
  effect fired its redirect on that transient null-token render, before the
  store had fully settled. Fixed by giving the redirect a short
  (200ms) grace window that's cancelled if the token appears before it
  fires, rather than acting on the very first render. Verified via a real
  Playwright hard-navigation test (previously reproduced reliably, now
  passes consistently). Worth another look with more time (see
  `docs/api.md`-adjacent notes / Part 3 write-up) — the exact library-level
  trigger wasn't fully root-caused, only the observable symptom was fixed.
- Step 4: conversation list (`src/features/chat/conversation-list.tsx`),
  chat shell sidebar (`src/features/chat/chat-shell.tsx`, using
  `components/ui/sidebar.tsx`), logout wired up. Verified against the live
  API with a real logged-in user (28 real conversations rendered
  correctly, sorted, previews/timestamps correct); loading skeleton, empty
  state, and error-with-retry (via simulated network failure) all verified
  in-browser.
- Steps 2–3: shared Axios instance (`src/lib/api-setting/axios.ts`, bearer
  interceptor + 401/NO_TOKEN handling), persisted Zustand auth store
  (`src/features/auth/store.ts`), login form/page, and the `/chat` route
  guard. Verified end-to-end with a real Playwright run against the live
  API: login → redirect → session persists across reload → unauthenticated
  visit to `/chat` redirects to `/login`.
  **Two real bugs found and fixed along the way:** (1) a TDZ self-reference
  bug — `onRehydrateStorage`'s callback referenced the `useAuthStore` const
  it was still initializing, because zustand's localStorage rehydration
  resolves synchronously within the same `create()` call; fixed by using
  zustand's built-in `persist.hasHydrated()`/`onFinishHydration` from a
  separate hook instead of a custom store field. (2) that same code crashed
  SSR with a 500 — `useAuthStore.persist` is `undefined` server-side (the
  persist middleware bails out entirely without `window.localStorage`);
  fixed with an optional-chaining fallback in the hook's initial state.
- Step 1: `docs/api.md` written, every endpoint re-verified against the live
  API (not just the Swagger spec). Found and documented several
  undocumented quirks: groups require 3+ total members, `GET
/conversations/{id}/messages`'s `before` cursor is inclusive (causes a
  duplicate at page boundaries unless deduplicated client-side),
  `users/search`'s `q` param isn't actually enforced as required, missing
  vs. invalid tokens return different statuses (400 vs 401), and messaging
  a non-participant/non-admin action correctly 403s server-side.
- Removed all leftover dashboard-template code: billing/Stripe/Creem,
  workspaces/RBAC, Prisma/Postgres, Better Auth, Backblaze S3, Sentry,
  Arcjet, kanban, node-cron, and every route/feature/lib file tied to them.
  No database, no ORM, no backend of our own remains.
- Trimmed `package.json` from ~150 to ~45 dependencies; added
  `socket.io-client`.
- Fixed the ESLint setup (legacy `.eslintrc.json` was incompatible with
  ESLint 9 / Next 16 — replaced with `eslint.config.mjs`, and fixed
  `package.json`'s `lint` script which called the now-removed `next lint`).
- Verified baseline: `pnpm install`, `pnpm tsc --noEmit` (clean),
  `pnpm lint` (clean), dev server boots and serves without runtime errors.
- Pulled the real API shape (endpoints, request/response bodies, auth,
  Socket.IO real-time) directly from the live Swagger spec and live probe
  requests — see the plan file for the full findings.
- Rewrote `context/project-overview.md`, `architecture.md`, `ui-context.md`,
  `code-standards.md`, `env-reference.md`.

## In Progress

- This file.

## Next Up

- Step 2: shared Axios instance (`src/lib/api-setting/axios.ts`).
- Step 3: auth session store + login page.
- Steps 4–9: chat feature build (conversation list, message history,
  sending, real-time, auto-scroll, start conversation/group creation).
- Step 10: bonus feature.
- Step 11: landing page.
- Step 12: README Part 3 write-up.
- Step 13: deploy to Vercel + final verification.

See `/home/bilyoner/.claude/plans/i-applied-for-a-effervescent-flute.md` for
full step detail.

## Open Questions

- The Socket.IO auth handshake shape (token via `auth:` payload vs query
  param) isn't documented anywhere — needs empirical confirmation once
  `features/chat`'s real-time hook is being built.

## Architecture Decisions

| Decision                                                                | Reason                                                                                                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| No database/backend of our own — talk directly to the external chat API | The assignment is a pure frontend exercise against a given hosted API; a local DB/ORM would add complexity with no purpose |
| Single Vercel deployment — landing page at `/`, chat app at `/chat`     | Satisfies both required demo links from one live URL, simplest to ship given the same-day deadline                         |
| Session (JWT + user) held in a persisted Zustand store, not cookies     | No server of our own to set httpOnly cookies from; documented as a trade-off in the Part 3 write-up                        |

## Session Notes

Deadline is Aug 22 2026, 4:00 PM (same day as this work). Time-critical —
favor shipping the core chat flow over polish; the assignment explicitly
says the chat panel (message list, sending, real-time) is where the most
care should go.
