# Auth Module

## Purpose

Handles login and registration flows. Manages the Sanctum bearer token in `localStorage` and exposes it via `useAuthStore` to the rest of the app.

## Key Files

```
view/LoginView.vue       ← email + password form
view/RegisterView.vue    ← name + email + password + confirmation form
model/api.ts             ← login(), register() — thin wrappers around the API client
model/store.ts           ← useAuthStore
```

## State: `useAuthStore` (`model/store.ts`)

| Export | Description |
|--------|-------------|
| `token` | `ref<string \| null>` — current bearer token |
| `isAuthenticated` | `computed(() => !!token.value)` |
| `init()` | Reads `auth_token` from `localStorage` — **must be called once on app startup** |
| `login(email, password)` | Calls API, persists token, shows success toast |
| `register(name, email, password, confirmation)` | Calls API, persists token |
| `logout(unauthorized?)` | Clears token; `unauthorized=true` shows "Unauthorized" toast (used by the 401 interceptor) |

Token is stored in `localStorage` under the key `auth_token`. The Axios request interceptor in `src/core/api/client.ts` reads it automatically — **never read `localStorage` for the token outside `store.ts`**.

## Pitfalls

- **`init()` must run before the router guard evaluates `isAuthenticated`**, otherwise the user is always redirected to login on page refresh.
- `logout(true)` is reserved for 401 redirects. Calling `logout()` (no argument) triggers the "logged out" toast — don't use it from the 401 interceptor.
- Navigation after login/register happens in the view (`router.push('/')`), not inside the store.
- API errors are thrown as plain `Error` objects — catch them in the view component and display inline.

## Tests

```bash
pnpm cy:run:e2e --spec "cypress/e2e/login.cy.ts"
```
