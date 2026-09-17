# AI Workflow Rules

## Approach

Build incrementally. Read context files first. Implement against the spec — do not infer behavior that isn't defined.

## Before Writing Code

1. Check if the pattern already exists in `src/lib/` or `src/features/`
2. Check if a shadcn component covers the UI need before writing custom components
3. If a requirement is ambiguous, add it as an open question in `progress-tracker.md` before implementing

## Scoping Rules

- Work on one feature unit at a time
- Do not combine unrelated system boundaries in one step
- If a change cannot be verified end-to-end quickly, the scope is too broad — split it

## Split an implementation step if it combines

- UI changes and background/cron task changes
- Multiple unrelated API routes
- Behavior not clearly defined in context files

## Protected Files

Do not modify without explicit instruction:

- `src/components/ui/*` — managed by shadcn CLI

## Completion Checklist

Before marking a unit done:

1. The feature works end-to-end within its defined scope
2. No invariant in `architecture.md` was violated
3. `pnpm tsc --noEmit` passes
4. `progress-tracker.md` is updated

## Keeping Docs in Sync

Update the relevant context file when:

- System architecture or folder boundaries change
- A new storage or auth pattern is introduced
- A code convention is established or changed
- Feature scope changes
