import { computed, onMounted, ref } from "vue"
import { fetchPayableAccountsCounts } from "@/modules/accounts-payable/model/api"
import { clampPeriodToMin } from "@/modules/accounts-payable/model/composables/usePeriod"
import { getFormattedDate, getPreviousMonthDate, periodWithFirstDay } from "@/core/lib/format"

const CIRCUMFERENCE = 2 * Math.PI * 40

export function usePaidUnpaidDonut() {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const paid = ref(0)
  const paidZero = ref(0)
  const unpaid = ref(0)

  const previousMonthDate = getPreviousMonthDate()

  const total = computed(() => paid.value + paidZero.value + unpaid.value)
  const isEmpty = computed(() => total.value === 0)

  const paidStrokeDasharray = computed(() => {
    if (total.value === 0) return "0"
    const len = (paid.value / total.value) * CIRCUMFERENCE
    return `${len} ${CIRCUMFERENCE - len}`
  })

  const paidZeroStrokeDasharray = computed(() => {
    if (total.value === 0 || paidZero.value === 0) return "0"
    const len = (paidZero.value / total.value) * CIRCUMFERENCE
    return `${len} ${CIRCUMFERENCE - len}`
  })

  const paidZeroStrokeDashoffset = computed(() => {
    if (total.value === 0) return 0
    return -(paid.value / total.value) * CIRCUMFERENCE
  })

  const unpaidStrokeDasharray = computed(() => {
    if (total.value === 0 || unpaid.value === 0) return "0"
    const len = (unpaid.value / total.value) * CIRCUMFERENCE
    return `${len} ${CIRCUMFERENCE - len}`
  })

  const unpaidStrokeDashoffset = computed(() => {
    if (total.value === 0) return 0
    return -((paid.value + paidZero.value) / total.value) * CIRCUMFERENCE
  })

  async function loadData(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const period = clampPeriodToMin(periodWithFirstDay(getFormattedDate(previousMonthDate)))
      const { data } = await fetchPayableAccountsCounts(period)
      paid.value = data.paid
      paidZero.value = data.paid_zero
      unpaid.value = data.unpaid
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load accounts"
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void loadData()
  })

  return {
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
  }
}
