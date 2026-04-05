<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { CreditCard, RefreshCw, Plus, Pencil, Trash2 } from "lucide-vue-next"
import { toast } from "vue-sonner"
import {
  fetchTransportCards,
  fetchBalance,
  refreshBalance,
  createTransportCard,
  updateTransportCard,
  deleteTransportCard,
  type TransportCard,
  type TransportCardBalanceResponse,
  type CreateTransportCardPayload,
} from "@/modules/transport-card/model/api"
import { formatMoneyFromNumber } from "@/core/lib/format"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

const cards = ref<TransportCard[]>([])
const cardsLoading = ref(false)
const balancesById = reactive<Record<number, TransportCardBalanceResponse | null>>({})
const balanceLoadingById = reactive<Record<number, boolean>>({})
const balanceErrorById = reactive<Record<number, string | null>>({})
const balanceRefreshingById = reactive<Record<number, boolean>>({})

const createDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const formLoading = ref(false)
const cardToEdit = ref<TransportCard | null>(null)
const cardToDelete = ref<TransportCard | null>(null)

const form = ref<CreateTransportCardPayload>({
  name: "",
  username: "",
  password: "",
  card_number: "",
  cpf: "",
})

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function clearBalanceStateForId(id: number): void {
  delete balancesById[id]
  delete balanceLoadingById[id]
  delete balanceErrorById[id]
  delete balanceRefreshingById[id]
}

function clearAllBalanceStates(): void {
  for (const id of Object.keys(balancesById)) {
    clearBalanceStateForId(Number(id))
  }
}

async function loadBalanceForCard(cardId: number, forceRefresh = false): Promise<void> {
  balanceLoadingById[cardId] = true
  balanceErrorById[cardId] = null
  try {
    balancesById[cardId] = await fetchBalance(cardId, forceRefresh)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load balance"
    balanceErrorById[cardId] = msg
    toast.error("Error", { description: msg })
    balancesById[cardId] = null
  } finally {
    balanceLoadingById[cardId] = false
  }
}

async function loadBalancesForAllCards(): Promise<void> {
  const results = await Promise.allSettled(cards.value.map((c) => loadBalanceForCard(c.id)))
  const failed = results.filter((r) => r.status === "rejected")
  if (failed.length > 0 && failed.length === results.length) {
    toast.error("Error", {
      description: "Failed to load balances for all cards.",
    })
  }
}

async function handleRefreshForCard(cardId: number): Promise<void> {
  balanceRefreshingById[cardId] = true
  balanceErrorById[cardId] = null
  try {
    balancesById[cardId] = await refreshBalance(cardId)
    toast.success("Balance updated", {
      description: "Your transport card balance has been refreshed.",
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to refresh balance"
    balanceErrorById[cardId] = msg
    toast.error("Error", { description: msg })
  } finally {
    balanceRefreshingById[cardId] = false
  }
}

async function loadCards(): Promise<void> {
  cardsLoading.value = true
  clearAllBalanceStates()
  try {
    cards.value = await fetchTransportCards()
    if (cards.value.length > 0) {
      await loadBalancesForAllCards()
    }
  } catch (e) {
    toast.error("Error", {
      description: e instanceof Error ? e.message : "Failed to load transport cards",
    })
  } finally {
    cardsLoading.value = false
  }
}

function resetForm(): void {
  form.value = {
    name: "",
    username: "",
    password: "",
    card_number: "",
    cpf: "",
  }
  cardToEdit.value = null
  cardToDelete.value = null
}

function openCreateDialog(): void {
  resetForm()
  createDialogOpen.value = true
}

function openEditDialog(card: TransportCard): void {
  cardToEdit.value = card
  form.value = {
    name: card.name,
    username: card.username,
    password: "",
    card_number: card.card_number,
    cpf: card.cpf,
  }
  editDialogOpen.value = true
}

function openDeleteDialog(card: TransportCard): void {
  cardToDelete.value = card
  deleteDialogOpen.value = true
}

async function handleCreate(): Promise<void> {
  if (
    !form.value.name ||
    !form.value.username ||
    !form.value.password ||
    !form.value.card_number ||
    !form.value.cpf
  ) {
    toast.error("Validation", { description: "All fields are required." })
    return
  }
  formLoading.value = true
  try {
    await createTransportCard(form.value)
    toast.success("Card created", { description: "Transport card has been added." })
    createDialogOpen.value = false
    resetForm()
    await loadCards()
  } catch (e) {
    toast.error("Error", {
      description: e instanceof Error ? e.message : "Failed to create transport card",
    })
  } finally {
    formLoading.value = false
  }
}

async function handleUpdate(): Promise<void> {
  const card = cardToEdit.value
  if (!card) return
  const payload: {
    name?: string
    username?: string
    password?: string
    card_number?: string
    cpf?: string
  } = {
    name: form.value.name,
    username: form.value.username,
    card_number: form.value.card_number,
    cpf: form.value.cpf,
  }
  if (form.value.password) {
    payload.password = form.value.password
  }
  formLoading.value = true
  try {
    await updateTransportCard(card.id, payload)
    toast.success("Card updated", { description: "Transport card has been updated." })
    editDialogOpen.value = false
    resetForm()
    await loadCards()
  } catch (e) {
    toast.error("Error", {
      description: e instanceof Error ? e.message : "Failed to update transport card",
    })
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(): Promise<void> {
  const card = cardToDelete.value
  if (!card) return
  formLoading.value = true
  try {
    await deleteTransportCard(card.id)
    clearBalanceStateForId(card.id)
    toast.success("Card deleted", { description: "Transport card has been removed." })
    deleteDialogOpen.value = false
    resetForm()
    await loadCards()
  } catch (e) {
    toast.error("Error", {
      description: e instanceof Error ? e.message : "Failed to delete transport card",
    })
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  void loadCards()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Transport card</h1>
      <Button data-testid="transport-card-add" @click="openCreateDialog">
        <Plus class="size-4 shrink-0" aria-hidden="true" />
        Add card
      </Button>
    </div>

    <section>
      <h2 class="mb-3 text-lg font-medium">Cards</h2>
      <div
        v-if="cardsLoading"
        class="rounded-xl border bg-card p-8 text-center text-muted-foreground"
        data-testid="transport-cards-loading"
      >
        Loading…
      </div>
      <div
        v-else-if="cards.length === 0"
        class="rounded-xl border bg-card p-8 text-center text-muted-foreground"
        data-testid="transport-cards-empty"
      >
        No transport cards yet. Add one to get started.
      </div>
      <div
        v-else
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="transport-cards-grid"
      >
        <Card
          v-for="card in cards"
          :key="card.id"
          class="h-fit border-l-4 border-l-primary"
          data-testid="transport-card-balance"
        >
          <CardHeader class="pb-2">
            <CardTitle class="flex items-center justify-between gap-2 text-base font-medium">
              <span class="flex items-center gap-2">
                <CreditCard class="size-4 shrink-0 text-primary" aria-hidden="true" />
                {{ card.name }}
              </span>
              <span
                v-if="balancesById[card.id]?.from_cache"
                class="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
              >
                Cached
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 pt-0">
            <div class="space-y-1 text-sm text-muted-foreground">
              <p>Card: {{ card.card_number }}</p>
              <p>Username: {{ card.username }}</p>
            </div>
            <div v-if="balanceLoadingById[card.id]" class="rounded-lg bg-muted/50 px-4 py-3">
              <p class="text-muted-foreground">Loading balance…</p>
            </div>
            <div
              v-else-if="balanceErrorById[card.id]"
              class="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3"
            >
              <p class="text-sm text-destructive">{{ balanceErrorById[card.id] }}</p>
            </div>
            <div v-else-if="balancesById[card.id]" class="rounded-lg bg-primary/5 px-4 py-3">
              <p class="text-3xl font-bold tabular-nums">
                {{ formatMoneyFromNumber(balancesById[card.id]!.balance) }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                Holder: {{ balancesById[card.id]!.owner_name ?? "—" }}
              </p>
            </div>
            <template v-if="balancesById[card.id]">
              <p class="text-sm text-muted-foreground">
                Last updated: {{ formatDateTime(balancesById[card.id]!.updated_at) }}
              </p>
            </template>
            <div class="flex flex-wrap gap-2">
              <Button
                :disabled="balanceRefreshingById[card.id] || balanceLoadingById[card.id]"
                size="sm"
                @click="handleRefreshForCard(card.id)"
              >
                <RefreshCw
                  :class="['size-4 shrink-0', balanceRefreshingById[card.id] && 'animate-spin']"
                  aria-hidden="true"
                />
                {{ balanceRefreshingById[card.id] ? "Updating…" : "Update balance" }}
              </Button>
              <Button variant="outline" size="sm" @click="openEditDialog(card)">
                <Pencil class="size-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="sm" @click="openDeleteDialog(card)">
                <Trash2 class="size-4 text-destructive" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <Dialog v-model:open="createDialogOpen">
      <DialogContent class="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>New transport card</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4 py-4" @submit.prevent="handleCreate">
          <div class="grid gap-2">
            <Label for="create-name">Name</Label>
            <Input id="create-name" v-model="form.name" placeholder="e.g. Work card" />
          </div>
          <div class="grid gap-2">
            <Label for="create-username">Username</Label>
            <Input id="create-username" v-model="form.username" placeholder="Tacom username" />
          </div>
          <div class="grid gap-2">
            <Label for="create-password">Password</Label>
            <Input
              id="create-password"
              v-model="form.password"
              type="password"
              placeholder="Tacom password"
            />
          </div>
          <div class="grid gap-2">
            <Label for="create-card-number">Card number</Label>
            <Input id="create-card-number" v-model="form.card_number" placeholder="Card number" />
          </div>
          <div class="grid gap-2">
            <Label for="create-cpf">CPF</Label>
            <Input id="create-cpf" v-model="form.cpf" placeholder="CPF (numbers only)" />
          </div>
          <DialogFooter>
            <Button type="submit" class="mx-auto" :disabled="formLoading">
              {{ formLoading ? "Creating…" : "Create" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Edit transport card</DialogTitle>
        </DialogHeader>
        <form class="grid gap-4 py-4" @submit.prevent="handleUpdate">
          <div class="grid gap-2">
            <Label for="edit-name">Name</Label>
            <Input id="edit-name" v-model="form.name" placeholder="e.g. Work card" />
          </div>
          <div class="grid gap-2">
            <Label for="edit-username">Username</Label>
            <Input id="edit-username" v-model="form.username" placeholder="Tacom username" />
          </div>
          <div class="grid gap-2">
            <Label for="edit-password">Password (leave blank to keep)</Label>
            <Input
              id="edit-password"
              v-model="form.password"
              type="password"
              placeholder="New password"
            />
          </div>
          <div class="grid gap-2">
            <Label for="edit-card-number">Card number</Label>
            <Input id="edit-card-number" v-model="form.card_number" placeholder="Card number" />
          </div>
          <div class="grid gap-2">
            <Label for="edit-cpf">CPF</Label>
            <Input id="edit-cpf" v-model="form.cpf" placeholder="CPF (numbers only)" />
          </div>
          <DialogFooter>
            <Button type="submit" class="mx-auto" :disabled="formLoading">
              {{ formLoading ? "Saving…" : "Save" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent class="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Delete transport card</DialogTitle>
        </DialogHeader>
        <p v-if="cardToDelete" class="py-4 text-muted-foreground">
          Are you sure you want to delete "{{ cardToDelete.name }}"? This will also remove any
          cached balance data for this card.
        </p>
        <DialogFooter>
          <Button variant="outline" :disabled="formLoading" @click="deleteDialogOpen = false">
            Cancel
          </Button>
          <Button variant="destructive" :disabled="formLoading" @click="handleDelete">
            {{ formLoading ? "Deleting…" : "Delete" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
