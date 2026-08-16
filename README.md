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

## Documentation

| Doc | Purpose |
|-----|---------|
| [../docs/PLATFORM_SETUP_PLAN.md](../docs/PLATFORM_SETUP_PLAN.md) | Phased bootstrap (start here) |
| [../docs/STACK.md](../docs/STACK.md) | Locked dependency versions |
| [../docs/INTEGRATION.md](../docs/INTEGRATION.md) | OIDC contract for consumer apps |
