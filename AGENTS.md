# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Burley.ai is a single Next.js 16 application (Turbopack) serving a marketing site, client portal, admin portal, and 47+ API routes. Data layer is Firebase/Firestore (external SaaS), payments via Stripe, emails via Resend, AI features via OpenAI.

### Running the application

- `pnpm dev` starts the dev server on port 3000
- The app reads `.env.local` for environment variables. Firebase credentials are required for auth/data flows but the marketing pages render fine with placeholder values.

### Required environment variables

| Variable | Purpose |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Client SDK |
| `NEXT_PUBLIC_FIREBASE_WEB_API_KEY` | Firebase Client SDK |
| `ADMIN_UID` | Comma-separated admin UIDs |
| `STRIPE_SECRET_KEY` | Payment flows (optional for marketing pages) |
| `RESEND_API_KEY` | Email (gracefully degrades) |
| `OPENAI_API_KEY` | AI task scoping (optional) |

### Testing

- **Unit tests:** `pnpm test` (vitest, 3 test files in `__tests__/`)
- **E2E tests:** `pnpm test:e2e` (Playwright, requires dev server running, tests in `e2e/`)
- **Lint:** `pnpm lint` (ESLint 9 with eslint-config-next flat config)

### Auth architecture

- Auth uses Firebase Auth with session cookies (`__session`). Login at `/api/client/login` accepts email/password or an `idToken`.
- Admin routes (`/admin/*`) and client routes (`/client/dashboard/*`) are protected by `proxy.ts` which checks for the session cookie and redirects to `/client/login`.
- Admin API routes use `validateBearerOrAdmin()` from `lib/api-auth.ts` (accepts bearer token or admin session).
- Client API routes use `validateClientSession()` from `lib/client-auth.ts` (requires a client doc in Firestore for the session user).
- The `/api/client/scope-feature` route also accepts admin sessions with an optional `clientId` param for the admin board preview.

### Gotchas

- No eslint config shipped with the repo originally; one was added at `eslint.config.mjs` using `eslint-config-next` flat config format.
- ESLint and `eslint-config-next` were added as devDependencies since `pnpm lint` references them but they weren't listed in the original `package.json`.
- The codebase has ~16 pre-existing lint errors (mostly React hooks setState-in-effect warnings). These are not regressions.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` will not fail on TS errors.
- No Docker, no local databases. All data services are external SaaS (Firebase, Stripe, Resend, OpenAI).
- To test admin or client features locally, you need a Firebase Auth account and its UID must be in `ADMIN_UID` (for admin) or have a matching doc in the `clients` Firestore collection (for client).
