<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

const cards = ref<TransportCard[]>([])
const cardsLoading = ref(false)
const selectedCardId = ref<string | null>(null)
const balance = ref<TransportCardBalanceResponse | null>(null)
const balanceLoading = ref(false)
const balanceRefreshing = ref(false)
const error = ref<string | null>(null)

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

const selectedCard = computed(() => {
  if (!selectedCardId.value) return null
  return cards.value.find((c) => String(c.id) === selectedCardId.value) ?? null
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

async function loadCards(): Promise<void> {
  cardsLoading.value = true
  try {
    cards.value = await fetchTransportCards()
    const first = cards.value[0]
    if (first && !selectedCardId.value) {
      selectedCardId.value = String(first.id)
    }
    if (cards.value.length === 0) {
      selectedCardId.value = null
    }
  } catch (e) {
    toast.error("Error", {
      description: e instanceof Error ? e.message : "Failed to load transport cards",
    })
  } finally {
    cardsLoading.value = false
  }
}

async function loadBalance(forceRefresh = false): Promise<void> {
  const id = selectedCardId.value
  if (!id) {
    balance.value = null
    return
  }
  balanceLoading.value = true
  error.value = null
  try {
    balance.value = await fetchBalance(Number(id), forceRefresh)
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load balance"
    toast.error("Error", { description: error.value })
    balance.value = null
  } finally {
    balanceLoading.value = false
  }
}

async function handleRefresh(): Promise<void> {
  if (!selectedCardId.value) return
  balanceRefreshing.value = true
  error.value = null
  try {
    balance.value = await refreshBalance(Number(selectedCardId.value))
    toast.success("Balance updated", {
      description: "Your transport card balance has been refreshed.",
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to refresh balance"
    toast.error("Error", { description: error.value })
  } finally {
    balanceRefreshing.value = false
  }
}

watch(selectedCardId, (id) => {
  if (id) {
    void loadBalance()
  } else {
    balance.value = null
  }
})

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
    toast.success("Card deleted", { description: "Transport card has been removed." })
    deleteDialogOpen.value = false
    resetForm()
    if (selectedCardId.value === String(card.id)) {
      selectedCardId.value = null
    }
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
        class="bg-card w-full overflow-hidden rounded-xl border shadow-sm"
        data-testid="transport-cards-table"
      >
        <Table>
          <TableHeader class="bg-card">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Card number</TableHead>
              <TableHead>Username</TableHead>
              <TableHead class="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="cardsLoading">
              <TableCell colspan="4" class="py-8 text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
            <TableRow v-else-if="cards.length === 0">
              <TableCell colspan="4" class="py-8 text-center text-muted-foreground">
                No transport cards yet. Add one to get started.
              </TableCell>
            </TableRow>
            <TableRow v-for="card in cards" :key="card.id">
              <TableCell class="font-medium">{{ card.name }}</TableCell>
              <TableCell>{{ card.card_number }}</TableCell>
              <TableCell class="text-muted-foreground">{{ card.username }}</TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="openEditDialog(card)">
                    <Pencil class="size-4" aria-hidden="true" />
                  </Button>
                  <Button variant="outline" size="sm" @click="openDeleteDialog(card)">
                    <Trash2 class="size-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>

    <section v-if="cards.length > 0">
      <h2 class="mb-3 text-lg font-medium">Balance</h2>
      <div class="flex flex-wrap items-end gap-4">
        <div class="min-w-[200px] space-y-2">
          <Label for="card-select">Select card</Label>
          <Select v-model="selectedCardId">
            <SelectTrigger id="card-select" class="w-full">
              <SelectValue placeholder="Choose a card" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="card in cards" :key="card.id" :value="String(card.id)">
                {{ card.name }} ({{ card.card_number }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p v-if="error" class="mt-2 text-sm text-destructive">
        {{ error }}
      </p>

      <Card
        v-if="balance && selectedCard"
        class="mt-4 h-fit border-l-4 border-l-primary"
        data-testid="transport-card-balance"
      >
        <CardHeader class="pb-2">
          <CardTitle class="flex items-center gap-2 text-base font-medium">
            <CreditCard class="size-4 shrink-0 text-primary" aria-hidden="true" />
            {{ selectedCard.name }}
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
          <Button :disabled="balanceRefreshing || balanceLoading" @click="handleRefresh">
            <RefreshCw
              :class="['size-4 shrink-0', balanceRefreshing && 'animate-spin']"
              aria-hidden="true"
            />
            {{ balanceRefreshing ? "Updating..." : "Update balance" }}
          </Button>
        </CardContent>
      </Card>

      <div
        v-else-if="balanceLoading"
        class="mt-4 rounded-lg border p-8 text-center text-muted-foreground"
      >
        Loading balance...
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
