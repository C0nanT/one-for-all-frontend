# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Vue 3** (Composition API + `<script setup>`) + **TypeScript**
- **Vite 7**, **Tailwind CSS v4**, **shadcn-vue** (New York style), **Reka UI**, **Lucide**
- **Pinia** for state, **Vue Router 4** for routing, **Axios** for HTTP
- **Cypress 15** for e2e and component tests
- Package manager: **pnpm**

## Common Commands

```bash
pnpm dev              # local dev server (http://localhost:5173)
pnpm build            # type-check + production build
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier over src/
pnpm type-check       # vue-tsc only

# Cypress
pnpm cy:open          # interactive test runner
pnpm cy:run           # headless full run
pnpm cy:run:e2e       # e2e tests only
pnpm cy:run:component # component tests only
```

Docker (hot reload dev):

```bash
make up   # docker compose up -d app-dev (http://localhost:5173)
make logs # follow container logs
```

Set `VITE_API_URL` in `.env` (see `.env.example`) to point at the backend.

## Architecture

The frontend mirrors the backend's modular structure. Each business domain is self-contained under `src/modules/`:

```
src/
  core/
    api/
      client.ts       ← Axios instance (Bearer token injection, 401 handling, base URL)
      users.ts        ← cross-module API calls
    router/index.ts   ← all routes; guards redirect unauthenticated users to /login
    stores/           ← global Pinia stores
    composables/      ← cross-module composables
    lib/              ← shared utilities (format, cn)
  shared/
    components/ui/    ← shadcn-vue components (Badge, Button, Dialog, etc.)
    layouts/          ← AuthenticatedLayout wraps all protected routes
  modules/
    auth/
      view/           ← LoginView, RegisterView
      model/store.ts  ← auth Pinia store (token, user, isAuthenticated)
    dashboard/
    accounts-payable/
      view/           ← AccountsPayableView + components/
      model/
        api.ts        ← module-specific API calls
        composables/  ← business logic composables
    transit-card/
    transport-card/
```

**Routing**: public routes (`/login`, `/register`) use `meta: { public: true }`; everything else lives under the authenticated layout with `meta: { requiresAuth: true }`. The router guard checks `authStore.isAuthenticated`.

**API layer**: `src/core/api/client.ts` is the single Axios instance. All API functions return `response.data` directly (the response interceptor unwraps it). Errors are thrown as plain `Error` objects with the backend message. Modules keep their own `model/api.ts` for domain-specific endpoints.

**Auth token**: stored in `localStorage` under the key `auth_token`. The request interceptor adds it as `Authorization: Bearer <token>` on every request.

## Module Context Files

Each module has its own `CLAUDE.md` with domain-specific context: API functions, composables, state, and common pitfalls. **Before working on any module, read its CLAUDE.md first.**

```
src/modules/auth/CLAUDE.md
src/modules/dashboard/CLAUDE.md
src/modules/accounts-payable/CLAUDE.md
src/modules/transport-card/CLAUDE.md
```

## Conventions

- Components live in each module's `view/` or `view/components/` directory.
- Business logic (API calls, state) lives in `model/` with composables under `model/composables/`.
- Use composables for anything stateful; keep `.vue` files focused on the template.
- UI primitives come from `src/shared/components/ui/` (shadcn-vue); add new ones there, not inside modules.
- Pre-commit hook runs ESLint + Prettier on staged `src/**/*.{vue,ts,tsx}` files automatically.
