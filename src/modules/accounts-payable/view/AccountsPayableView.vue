<script setup lang="ts">
import { computed, onMounted, unref, watch } from "vue"
import { ChevronLeft, ChevronRight, CircleDollarSign, NotebookPen } from "lucide-vue-next"
import { useAccountsList } from "@/modules/accounts-payable/model/composables/useAccountsList"
import { useUsers } from "@/core/composables/useUsers"
import { useCreateAccountDialog } from "@/modules/accounts-payable/model/composables/useCreateAccountDialog"
import { usePayDialog } from "@/modules/accounts-payable/model/composables/usePayDialog"
import { useEditPaymentDialog } from "@/modules/accounts-payable/model/composables/useEditPaymentDialog"
import { useNotesSection } from "@/modules/accounts-payable/model/composables/useNotesSection"
import { formatMoneyFromNumber, formatPeriodMonthYear } from "@/core/lib/format"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import AccountsTable from "./components/AccountsTable.vue"
import CreateAccountDialog from "./components/CreateAccountDialog.vue"
import EditFormDialog from "./components/EditFormDialog.vue"
import NotesSection from "./components/NotesSection.vue"
import PayFormDialog from "./components/PayFormDialog.vue"
import UserPaymentProgressBar from "./components/UserPaymentProgressBar.vue"

const list = useAccountsList()
const users = useUsers()
const createDialog = useCreateAccountDialog(list)
const pay = usePayDialog(list, users)
const edit = useEditPaymentDialog(list, users)
const notes = useNotesSection()

function closeDropdown(): void {
  // No-op; dropdown state is managed by AccountsTable
}

const tableItems = computed(() => list.items.value ?? [])
const tableLoading = computed(() => list.loading.value)
const summary = computed(() => unref(list.summary))
const paidByUserWithPercentage = computed(() => list.paidByUserWithPercentage.value)

watch(
  () => list.listPeriod.value,
  (period) => {
    void notes.loadNotes(period)
  },
)

onMounted(() => {
  void list.loadList()
  void notes.loadNotes(list.listPeriod.value)
  void users.loadUsers()
})
</script>

<template>
  <div class="space-y-6">
    <p v-if="list.error" class="text-sm text-destructive">
      {{ list.error }}
    </p>

    <div class="flex items-center justify-between bg-card p-4 rounded-md">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold" data-testid="accounts-payable-title">
          Accounts payable
        </h1>
        <div class="flex items-center gap-1" data-testid="accounts-payable-period-selector">
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="unref(list.isMinListPeriod)"
            @click="list.prevMonth"
          >
            <ChevronLeft class="size-4" />
          </Button>
          <span class="min-w-20 text-center font-medium tabular-nums">
            {{ formatPeriodMonthYear(unref(list.listPeriod)) }}
          </span>
          <Button variant="ghost" size="icon-sm" @click="list.nextMonth">
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>

      <CreateAccountDialog :dialog="createDialog" />
    </div>

    <div class="grid items-start gap-2 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Card
          v-if="summary"
          data-testid="accounts-payable-summary"
          class="h-fit border-l-4 border-l-primary gap-0"
        >
          <CardHeader class="pb-0">
            <CardTitle class="flex items-center gap-2 text-base font-medium">
              <CircleDollarSign class="size-4 shrink-0 text-primary" aria-hidden="true" />
              Month total
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 pt-1">
            <div class="rounded-lg bg-primary/5 px-4 py-2">
              <p class="text-3xl font-bold tabular-nums">
                {{ formatMoneyFromNumber(summary.month_total) }}
              </p>
            </div>
            <div class="border-t border-border pt-4">
              <p class="mb-2 text-sm font-medium text-muted-foreground">Paid by user</p>
              <ul v-if="paidByUserWithPercentage.length > 0" class="space-y-1 text-base">
                <li
                  v-for="item in paidByUserWithPercentage"
                  :key="item.user_id"
                  class="flex flex-col gap-1.5 rounded-md py-2 px-2 -mx-2 transition-colors hover:bg-muted/50"
                >
                  <div class="flex items-center justify-between">
                    <span>{{ item.name }}</span>
                    <span class="tabular-nums text-muted-foreground">
                      {{ formatMoneyFromNumber(item.total_paid) }}
                    </span>
                  </div>
                  <UserPaymentProgressBar :percentage="item.percentage" />
                </li>
              </ul>
              <p v-else class="text-sm text-muted-foreground">
                No payments with payer in this period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="h-fit border-l-4 border-l-muted-foreground/30 gap-0">
          <CardHeader class="pb-0">
            <CardTitle class="flex items-center gap-2 text-base font-medium">
              <NotebookPen class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-2">
            <NotesSection
              :composable="notes"
              :accounts="tableItems"
              :users="unref(users.users)"
              :period="unref(list.listPeriod)"
            />
          </CardContent>
        </Card>
      </div>

      <div class="min-w-0">
        <AccountsTable
          :items="tableItems"
          :loading="tableLoading"
          @pay="(item) => pay.open(item, closeDropdown)"
          @edit="(item) => edit.open(item, closeDropdown)"
        />
      </div>
    </div>

    <PayFormDialog :dialog="pay" :users="users" />
    <EditFormDialog :dialog="edit" :users="users" />
  </div>
</template>
