# @aponika/auth-frontend

SolidStart app for end-user identity flows: login, register, password reset, account settings, MFA.

**Local port:** `3011`  
**Setup status:** SolidStart 1.1 + Tailwind 4 — see [platform setup plan](../docs/PLATFORM_SETUP_PLAN.md).

## Prerequisites

- Node.js 22 (`nvm use` reads `.nvmrc`)
- pnpm 10

## Commands

```bash
pnpm install
cp .env.example .env.development   # first time
pnpm dev                           # http://localhost:3011
pnpm build
pnpm typecheck
```

## Environment

Copy `.env.example` to `.env.development`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_ORIGIN` | `http://localhost:3010` | Auth API origin (no path) |
| `VITE_API_BASE_URL` | `http://localhost:3010/api/v1` | Versioned API base for `fetcher()` |
| `VITE_HEALTH_URL` | `http://localhost:3010/health` | Public health smoke test |
| `VITE_CLIENT_TIMEOUT` | `30000` | Browser fetch timeout (ms) |
| `VITE_SERVER_TIMEOUT` | `30000` | SSR fetch timeout (ms) |

In dev, the login page shows API health when the backend is running (`pnpm dev` on port 3011 requires backend CORS for this origin).

## Documentation

| Doc | Purpose |
|-----|---------|
| [../docs/PLATFORM_SETUP_PLAN.md](../docs/PLATFORM_SETUP_PLAN.md) | Phased bootstrap (start here) |
| [../docs/STACK.md](../docs/STACK.md) | Locked dependency versions |
| [../docs/INTEGRATION.md](../docs/INTEGRATION.md) | OIDC contract for consumer apps |
| [../docs/SHARED_UI_SYNC.md](../docs/SHARED_UI_SYNC.md) | Governed UI sync between admin and frontend |
