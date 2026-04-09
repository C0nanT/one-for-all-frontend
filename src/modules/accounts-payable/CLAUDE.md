# Accounts Payable Module

## Purpose

Full management of shared monthly expenses: listing by period, recording payments (who paid, how much), and attaching notes. The most feature-rich module in the app.

## Dependencies

- `@/core/composables/useUsers` — used by pay/edit dialogs to populate the payer dropdown.
- `@/core/lib/format` — `periodWithFirstDay`, `getFormattedDate`, etc.

## Key Files

```
view/AccountsPayableView.vue
view/components/
  AccountsTable.vue           ← table of accounts with status badges
  CreateAccountDialog.vue     ← create new account
  EditFormDialog.vue          ← edit account name
  PayFormDialog.vue           ← record or update a payment (amount + payer dropdown)
  NotesSection.vue            ← notes list with CRUD
  PeriodSelector.vue          ← month/year picker (emits update:period)
  UserPaymentProgressBar.vue  ← shows each user's share of the total

model/api.ts                  ← all API functions + TypeScript types
model/composables/
  useAccountsList.ts          ← fetches accounts + summary for the current period
  useCreateAccountDialog.ts   ← form state and submit for creating an account
  useEditPaymentDialog.ts     ← form state and submit for editing an existing payment
  usePayDialog.ts             ← form state and submit for recording a new payment
  useNotesSection.ts          ← notes list state + CRUD
  usePeriod.ts                ← period utilities and constants (NOT a stateful composable)
```

## API Functions (`model/api.ts`)

| Function | Description |
|----------|-------------|
| `fetchPayableAccounts(period)` | Returns `{ data: PayableAccount[], summary }` |
| `fetchPayableAccountsCounts(period)` | Returns `{ data: { paid, unpaid, paid_zero } }` |
| `createPayableAccount(name)` | Returns new account |
| `payPayableAccount(id, amount, period, payer_id)` | Records first payment |
| `updatePayableAccountPayment(accountId, paymentId, amount, period, payer_id)` | Updates existing payment |
| `fetchNotes(period)` | Returns `PayableAccountNote[]` |
| `createNote(data)` | Creates note |
| `updateNote(id, data)` | Updates note |
| `deleteNote(id)` | Deletes note |

## Period utilities (`usePeriod.ts`)

This file exports **utility functions and constants**, not a reactive composable:

| Export | Description |
|--------|-------------|
| `MONTHS` | Array of `{ value, label }` for all 12 months |
| `MIN_PERIOD_YEAR / MIN_PERIOD_MONTH` | Minimum allowed period: September 2025 |
| `clampPeriodToMin(period)` | Ensures period is not before the minimum |
| `monthOptionsForYear(year)` | Filters months based on minimum period for a given year |
| `usePeriodYearOptions()` | Returns computed array of valid years (min year → current year) |

## Pitfalls

- **`usePeriod.ts` has no reactive `currentPeriod` state** — period state is managed in `AccountsPayableView.vue` using a local `ref`, then passed down as a prop to child components and composables.
- **`payer_id` is nullable** — always allow null in payer dropdowns. A payment without a payer is valid.
- **After any mutation, refresh the list** via the composable's reload function — do not navigate or reload the page.
- **Components in `view/components/` are module-private** — do not import them from other modules. Shared UI primitives belong in `src/shared/components/ui/`.
- **`fetchPayableAccountsCounts` is also used by the dashboard** — changes to the response shape affect both modules.

## Tests

```bash
pnpm cy:run:e2e --spec "cypress/e2e/accounts-payable.cy.ts"
```
