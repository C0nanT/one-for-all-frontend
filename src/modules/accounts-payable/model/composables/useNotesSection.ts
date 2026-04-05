import { ref } from "vue"
import { toast } from "vue-sonner"
import { formatMoneyBR, formatMoneyFromNumber, parseMoneyBR } from "@/core/lib/format"
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  type PayableAccountNote,
} from "@/modules/accounts-payable/model/api"

export function useNotesSection() {
  const notes = ref<PayableAccountNote[]>([])
  const loading = ref(false)
  const formOpen = ref(false)
  const editingNote = ref<PayableAccountNote | null>(null)
  const submitting = ref(false)
  const deletingId = ref<number | null>(null)

  const formText = ref("")
  const formAccountId = ref("")
  const formAmount = ref("")
  const formUserId = ref("")
  const formDate = ref("")

  async function loadNotes(period: string): Promise<void> {
    loading.value = true
    try {
      notes.value = await fetchNotes(period)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load notes")
    } finally {
      loading.value = false
    }
  }

  function openCreate(): void {
    editingNote.value = null
    formText.value = ""
    formAccountId.value = ""
    formAmount.value = ""
    formUserId.value = ""
    formDate.value = new Date().toISOString().slice(0, 10)
    formOpen.value = true
  }

  function openEdit(note: PayableAccountNote): void {
    editingNote.value = note
    formText.value = note.text
    formAccountId.value = String(note.payable_account_id)
    formAmount.value = formatMoneyFromNumber(note.amount)
    formUserId.value = String(note.user_id)
    const parts = note.date.split("-")
    formDate.value = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ""
    formOpen.value = true
  }

  function cancelForm(): void {
    formOpen.value = false
    editingNote.value = null
  }

  function onAmountInput(e: Event): void {
    const target = e.target as HTMLInputElement
    const digits = target.value.replace(/\D/g, "")
    formAmount.value = formatMoneyBR(digits)
  }

  function isFormValid(): boolean {
    return (
      formText.value.trim().length > 0 &&
      !!formAccountId.value &&
      parseMoneyBR(formAmount.value) >= 0 &&
      !!formUserId.value &&
      !!formDate.value
    )
  }

  async function submitForm(period: string): Promise<void> {
    if (!isFormValid()) return
    submitting.value = true
    try {
      const data = {
        text: formText.value.trim(),
        payable_account_id: Number(formAccountId.value),
        amount: parseMoneyBR(formAmount.value),
        user_id: Number(formUserId.value),
        date: formDate.value,
      }
      if (editingNote.value) {
        await updateNote(editingNote.value.id, data)
        toast.success("Note updated")
      } else {
        await createNote(data)
        toast.success("Note created")
      }
      cancelForm()
      await loadNotes(period)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save note")
    } finally {
      submitting.value = false
    }
  }

  async function removeNote(id: number): Promise<void> {
    deletingId.value = id
    try {
      await deleteNote(id)
      notes.value = notes.value.filter((n) => n.id !== id)
      toast.success("Note deleted")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete note")
    } finally {
      deletingId.value = null
    }
  }

  return {
    notes,
    loading,
    formOpen,
    editingNote,
    submitting,
    deletingId,
    formText,
    formAccountId,
    formAmount,
    formUserId,
    formDate,
    loadNotes,
    openCreate,
    openEdit,
    cancelForm,
    onAmountInput,
    isFormValid,
    submitForm,
    removeNote,
  }
}

export type UseNotesSectionReturn = ReturnType<typeof useNotesSection>
