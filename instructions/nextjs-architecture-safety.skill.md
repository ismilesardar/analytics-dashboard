---
description: 'Architecture-first change workflow for this workspace'
applyTo: 'src/**/*.{ts,tsx,js,jsx}'
---

# Architecture-First Change Workflow

## Purpose

Use this workflow for any code change that may affect product structure, the shared API client layer, shared models, or multiple features. This app has no real database — data lives in a mock JSON dataset served through this app's own Next.js Route Handlers.

## Workflow

1. Review the requested change and identify the primary feature, related features, and shared layers it touches.
2. Check the current architecture before editing:
   - `src/features/`
   - `src/lib/`
   - `src/components/`
   - `src/store/`
   - `src/hooks/`
   - `src/types/`
   - `src/utils/`
   - `src/config/`
3. Prefer existing patterns and abstractions over new ad hoc code.
4. Keep API calls and request/response shapes standard and centralized through `src/lib/api-setting/`.
5. Split dependencies and related logic into multiple files when the task naturally requires it.
6. Before editing, check for side effects on other features, shared utilities, and data flow.
7. Make the smallest safe change that preserves the product architecture.
8. After the change, verify that no obvious regressions were introduced.

## Decision Rules

- If a change can reuse an existing feature, helper, or model, reuse it.
- If a change would duplicate shared logic, extract a dependency instead.
- If a change crosses feature boundaries, inspect all impacted files before editing.
- If a change touches how data is fetched, cached, or sent to the external API, inspect `src/lib/api-setting/` (Axios instance + interceptors, React Query client) before editing — this is the only shared data layer in the app.
- If a change touches authentication or session state, inspect `src/features/auth/` (the persisted Zustand session store) before editing — there is no server-side session of our own.
- Do not introduce throwaway or unrelated code.

## Completion Check

- The change follows the existing product architecture.
- Dependencies are placed in the correct files.
- API access remains centralized through `src/lib/api-setting/`.
- Potential regressions were considered before editing.
