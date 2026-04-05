<script setup lang="ts">
import { computed, unref } from "vue"
import type { Ref } from "vue"
import { Pencil, Plus, Trash2 } from "lucide-vue-next"
import type { UseNotesSectionReturn } from "@/modules/accounts-payable/model/composables/useNotesSection"
import type { PayableAccount } from "@/modules/accounts-payable/model/api"
import type { User } from "@/core/api/users"
import { formatDateHyphenToSlash, formatMoneyFromNumber } from "@/core/lib/format"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const props = defineProps<{
  composable: UseNotesSectionReturn
  accounts: PayableAccount[]
  users: User[]
  period: string
}>()

const c = props.composable

const formAccountModel = computed({
  get: () => unref(c.formAccountId),
  set: (v) => {
    ;(c.formAccountId as Ref<string>).value = v ?? ""
  },
})

const formUserModel = computed({
  get: () => unref(c.formUserId),
  set: (v) => {
    ;(c.formUserId as Ref<string>).value = v ?? ""
  },
})

const formTextModel = computed({
  get: () => unref(c.formText),
  set: (v) => {
    ;(c.formText as Ref<string>).value = v
  },
})

const formDateModel = computed({
  get: () => unref(c.formDate),
  set: (v) => {
    ;(c.formDate as Ref<string>).value = v
  },
})
</script>

<template>
  <div>
    <div class="flex justify-end mb-3">
      <Button
        v-if="!unref(c.formOpen)"
        variant="outline"
        size="sm"
        class="h-7 gap-1 text-xs"
        @click="c.openCreate()"
      >
        <Plus class="size-3" />
        Add note
      </Button>
    </div>

    <form
      v-if="unref(c.formOpen)"
      class="mb-4 rounded-md border border-border bg-muted/30 p-3 space-y-3"
      @submit.prevent="c.submitForm(props.period)"
    >
      <div class="grid gap-1.5">
        <Label for="note-text" class="text-xs">Note</Label>
        <textarea
          id="note-text"
          v-model="formTextModel"
          rows="3"
          placeholder="Describe the expense…"
          class="placeholder:text-muted-foreground border-input dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div class="grid gap-1.5">
        <Label for="note-account" class="text-xs">Account</Label>
        <Select v-model="formAccountModel">
          <SelectTrigger id="note-account" class="w-full h-8 text-sm">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="a in props.accounts" :key="a.id" :value="String(a.id)">
              {{ a.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="grid gap-1.5">
          <Label for="note-amount" class="text-xs">Amount</Label>
          <Input
            id="note-amount"
            :model-value="unref(c.formAmount)"
            type="text"
            inputmode="decimal"
            placeholder="R$ 0,00"
            class="h-8 text-sm"
            @input="c.onAmountInput"
          />
        </div>
        <div class="grid gap-1.5">
          <Label for="note-date" class="text-xs">Date</Label>
          <Input id="note-date" v-model="formDateModel" type="date" class="h-8 text-sm" />
        </div>
      </div>

      <div class="grid gap-1.5">
        <Label for="note-user" class="text-xs">User</Label>
        <Select v-model="formUserModel">
          <SelectTrigger id="note-user" class="w-full h-8 text-sm">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="u in props.users" :key="u.id" :value="String(u.id)">
              {{ u.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" class="h-7 text-xs" @click="c.cancelForm()">
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          class="h-7 text-xs"
          :disabled="!c.isFormValid() || unref(c.submitting)"
        >
          {{ unref(c.submitting) ? "Saving…" : unref(c.editingNote) ? "Update" : "Save" }}
        </Button>
      </div>
    </form>

    <div v-if="unref(c.loading)" class="space-y-2">
      <div v-for="i in 2" :key="i" class="h-14 rounded-md bg-muted/50 animate-pulse" />
    </div>

    <ul v-else-if="unref(c.notes).length > 0" class="space-y-2">
      <li
        v-for="note in unref(c.notes)"
        :key="note.id"
        class="rounded-md border border-border bg-card px-3 py-2 text-sm"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm leading-snug flex-1 min-w-0 break-words">{{ note.text }}</p>
          <div class="flex items-center gap-1 shrink-0 mt-0.5">
            <Button
              variant="ghost"
              size="icon"
              class="size-6"
              :disabled="unref(c.deletingId) === note.id"
              @click="c.openEdit(note)"
            >
              <Pencil class="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-6 text-destructive hover:text-destructive"
              :disabled="unref(c.deletingId) === note.id"
              @click="c.removeNote(note.id)"
            >
              <Trash2 class="size-3" />
            </Button>
          </div>
        </div>
        <div
          class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground"
        >
          <span>{{ note.account_name }}</span>
          <span class="font-medium tabular-nums text-foreground">
            {{ formatMoneyFromNumber(note.amount) }}
          </span>
          <span>{{ formatDateHyphenToSlash(note.date) }}</span>
          <span>{{ note.user_name }}</span>
        </div>
      </li>
    </ul>

    <p v-else class="text-xs text-muted-foreground">No notes for this period</p>
  </div>
</template>
