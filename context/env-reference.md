# Environment Variable Reference

Copy `.env.example` to `.env` for local development. Never commit `.env`.

## Application

| Variable                   | Example                                          | Notes                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://frontend-task-chatapp.onrender.com/api` | Base URL of the external chat API this app talks to directly. See `src/config/env.ts` — the Socket.IO origin is derived from this at runtime (same host, without the `/api` suffix), not a separate variable. |

That's the only environment variable this app needs — there is no database,
auth provider, storage, email, or billing integration of our own.

## Notes

- `NEXT_PUBLIC_*` variables are inlined at build time — changing them after
  build has no effect on deployed output.
- When deploying (Vercel), set `NEXT_PUBLIC_API_BASE_URL` in the project's
  environment settings to the same value as `.env.example`.
