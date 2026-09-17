# Environment Variable Reference

**No environment variables are required.** All data is served by this
app's own Next.js Route Handlers reading a local mock JSON dataset
(`src/data/*.json`) — there's no external API, database, auth provider,
storage, email, or billing integration to configure.

The shared Axios instance (`src/lib/api-setting/axios.ts`) calls `/api/...`
with relative paths and no `baseURL`, so it works identically in dev,
preview, and production deployments with zero configuration.

## Seeded login

For local testing, `src/data/users.json` seeds one mock user:

| Email             | Password    |
| ----------------- | ----------- |
| `admin@pulse.dev` | `admin1234` |

The password is stored hashed (`scrypt`, see `src/lib/server/password.ts`)
even in this mock dataset — never plaintext.
