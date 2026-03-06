<script setup lang="ts">
import { RouterLink } from "vue-router"
import { usePaidUnpaidDonut } from "@/modules/dashboard/model/composables/usePaidUnpaidDonut"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

const {
  loading,
  error,
  paid,
  paidZero,
  unpaid,
  total,
  isEmpty,
  paidStrokeDasharray,
  paidZeroStrokeDasharray,
  paidZeroStrokeDashoffset,
  unpaidStrokeDasharray,
  unpaidStrokeDashoffset,
} = usePaidUnpaidDonut()
</script>

<template>
  <RouterLink
    :to="{ name: 'AccountsPayable' }"
    data-testid="dashboard-accounts-payable-card"
    class="block w-full max-w-[280px] transition-opacity transition-transform duration-300 hover:scale-105 hover:opacity-90"
  >
    <Card class="w-full cursor-pointer">
      <CardHeader class="pb-2">
        <CardTitle class="text-base"> Accounts payable </CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div
            class="size-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"
            role="status"
            aria-label="Loading"
          />
        </div>
        <div v-else-if="error" class="py-6 text-center text-sm text-muted-foreground">
          {{ error }}
        </div>
        <div v-else-if="isEmpty" class="py-6 text-center text-sm text-muted-foreground">
          No accounts in this period
        </div>
        <div v-else class="flex flex-col items-center gap-4">
          <div class="relative">
            <svg viewBox="0 0 100 100" class="size-24 -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" stroke-width="12" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--success)"
                stroke-width="12"
                :stroke-dasharray="paidStrokeDasharray"
              />
              <circle
                v-if="paidZero > 0"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#737373"
                stroke-width="12"
                :stroke-dasharray="paidZeroStrokeDasharray"
                :stroke-dashoffset="paidZeroStrokeDashoffset"
              />
              <circle
                v-if="unpaid > 0"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--destructive)"
                stroke-width="12"
                :stroke-dasharray="unpaidStrokeDasharray"
                :stroke-dashoffset="unpaidStrokeDashoffset"
              />
            </svg>
            <span
              class="absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums"
            >
              {{ total }}
            </span>
          </div>
          <div class="flex flex-col gap-1 text-sm">
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-full"
                style="background-color: var(--success)"
              />
              <span class="text-muted-foreground">Paid:</span>
              <span class="font-medium tabular-nums">{{ paid }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-full"
                style="background-color: var(--destructive)"
              />
              <span class="text-muted-foreground">Unpaid:</span>
              <span class="font-medium tabular-nums">{{ unpaid }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block size-3 rounded-full bg-[#737373]" />
              <span class="text-muted-foreground">No charge:</span>
              <span class="font-medium tabular-nums">{{ paidZero }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
