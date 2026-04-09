# Transport Card Module

## Purpose

Lists stored transport cards and allows users to check the current balance of each card. Balance fetching hits the backend, which calls the external Tacom API and caches the result per day.

## Key Files

```
view/TransportCardView.vue   ← lists cards; shows balance per card with refresh action
model/api.ts                 ← all API functions + TypeScript types
```

## API Functions (`model/api.ts`)

| Function | Description |
|----------|-------------|
| `fetchTransportCards()` | Returns `TransportCard[]` |
| `fetchBalance(cardId, forceRefresh?)` | GET balance; `forceRefresh=true` adds `?refresh=1` |
| `refreshBalance(cardId)` | POST to force-refresh — preferred for user-triggered refreshes |
| `createTransportCard(payload)` | payload includes `password` (write-only) |
| `updateTransportCard(id, payload)` | all fields optional, `password` optional |
| `deleteTransportCard(id)` | — |

## Key Types

- `TransportCard` — `{ id, name, username, card_number, cpf, created_at, updated_at }` — **no `password` field**
- `TransportCardBalanceResponse` — `{ balance, updated_at, from_cache, card_number, last_used_at?, owner_name? }`

## Pitfalls

- **Never display or store `password` in the frontend.** It is write-only: sent on create/update, never returned by the API. The `TransportCard` type intentionally omits it.
- **`from_cache: true`** means the balance was already fetched today — show a visual indicator so the user knows it may not be live.
- **`last_used_at` and `owner_name` can be `null`** — always handle the nullable case in templates.
- **Use `refreshBalance` (POST) for user-triggered refresh**, not `fetchBalance` with `forceRefresh`. The POST endpoint is the canonical way to force a Tacom API call.
- No Pinia store — all state is local to the view or a composable inside this module.
