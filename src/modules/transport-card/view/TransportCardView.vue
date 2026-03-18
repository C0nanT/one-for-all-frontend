<script setup lang="ts">
import { ref, onMounted } from "vue"
import { CreditCard, RefreshCw } from "lucide-vue-next"
import { toast } from "vue-sonner"
import {
  fetchBalance,
  refreshBalance,
  type TransportCardBalanceResponse,
} from "@/modules/transport-card/model/api"
import { formatMoneyFromNumber } from "@/core/lib/format"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

const balance = ref<TransportCardBalanceResponse | null>(null)
const loading = ref(false)
const refreshing = ref(false)
const error = ref<string | null>(null)

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function loadBalance(forceRefresh = false): Promise<void> {
  loading.value = true
  error.value = null
  try {
    balance.value = await fetchBalance(forceRefresh)
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load balance"
    toast.error("Error", { description: error.value })
  } finally {
    loading.value = false
  }
}

async function handleRefresh(): Promise<void> {
  refreshing.value = true
  error.value = null
  try {
    balance.value = await refreshBalance()
    toast.success("Balance updated", {
      description: "Your transport card balance has been refreshed.",
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to refresh balance"
    toast.error("Error", { description: error.value })
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  void loadBalance()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Transport card</h1>
    </div>

    <p v-if="error" class="text-sm text-destructive">
      {{ error }}
    </p>

    <Card
      v-if="balance"
      class="h-fit border-l-4 border-l-primary"
      data-testid="transport-card-balance"
    >
      <CardHeader class="pb-2">
        <CardTitle class="flex items-center gap-2 text-base font-medium">
          <CreditCard class="size-4 shrink-0 text-primary" aria-hidden="true" />
          Balance
          <span
            v-if="balance.from_cache"
            class="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
          >
            Cached
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4 pt-0">
        <div class="rounded-lg bg-primary/5 px-4 py-3">
          <p class="text-3xl font-bold tabular-nums">
            {{ formatMoneyFromNumber(balance.balance) }}
          </p>
        </div>
        <div class="space-y-1 text-sm text-muted-foreground">
          <p>Holder: {{ balance.owner_name ?? "—" }}</p>
          <p>Card: {{ balance.card_number || "—" }}</p>
        </div>
        <p class="text-sm text-muted-foreground">
          Last updated: {{ formatDateTime(balance.updated_at) }}
        </p>
        <Button :disabled="refreshing || loading" @click="handleRefresh">
          <RefreshCw
            :class="['size-4 shrink-0', refreshing && 'animate-spin']"
            aria-hidden="true"
          />
          {{ refreshing ? "Updating..." : "Update balance" }}
        </Button>
      </CardContent>
    </Card>

    <div v-else-if="loading" class="rounded-lg border p-8 text-center text-muted-foreground">
      Loading balance...
    </div>
  </div>
</template>
