# Dashboard Module

## Purpose

Landing page after login. Shows a paid/unpaid/paid_zero donut chart for the previous month. Read-only — no mutations happen here.

## Dependencies

- `@/modules/accounts-payable/model/api` — calls `fetchPayableAccountsCounts(period)`
- `@/modules/accounts-payable/model/composables/usePeriod` — uses `clampPeriodToMin`
- `@/core/lib/format` — uses `getFormattedDate`, `getPreviousMonthDate`, `periodWithFirstDay`

No own store, no own API file.

## Key Files

```
view/DashboardView.vue
model/composables/usePaidUnpaidDonut.ts
```

## Composable: `usePaidUnpaidDonut`

Fetches counts for **the previous month** (not the current one) and computes SVG stroke values for an inline donut chart (radius 40, no external chart library).

| Export | Type | Description |
|--------|------|-------------|
| `loading` | `ref<boolean>` | True while fetching |
| `error` | `ref<string \| null>` | Error message if fetch failed |
| `paid` / `paidZero` / `unpaid` | `ref<number>` | Raw counts |
| `total` | `computed<number>` | Sum of the three |
| `isEmpty` | `computed<boolean>` | True when `total === 0` |
| `paidStrokeDasharray` | `computed<string>` | SVG stroke for paid arc |
| `paidZeroStrokeDasharray` | `computed<string>` | SVG stroke for paid_zero arc |
| `paidZeroStrokeDashoffset` | `computed<number>` | Offset to position after paid arc |
| `unpaidStrokeDasharray` | `computed<string>` | SVG stroke for unpaid arc |
| `unpaidStrokeDashoffset` | `computed<number>` | Offset to position after paid+paidZero |

Data is loaded in `onMounted`. Call `loadData()` to refresh manually.

## Pitfalls

- The period shown is always **the previous month**, clamped to the minimum allowed period (`2025-09`). Do not switch it to the current month without also updating the period logic in `usePaidUnpaidDonut`.
- Do not add a period selector to the dashboard — period navigation lives in the accounts-payable view.
- Do not import `usePaidUnpaidDonut` from other modules — it is dashboard-private.
