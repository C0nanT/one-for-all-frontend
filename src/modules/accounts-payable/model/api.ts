import { api } from "@/core/api/client"

export type PayableStatus = "unpaid" | "paid" | "paid_zero"

export interface PayableAccount {
  id: number
  name: string
  status: PayableStatus
  payment: {
    id?: number
    payer_id?: number | null
    payer: string | null
    amount: number
    period: string
  }
}

export interface PaidByUser {
  user_id: number
  name: string
  total_paid: number
}

export interface PayableAccountsSummary {
  period: string
  month_total: number
  paid_by_user: PaidByUser[]
}

export interface PayableAccountsListResponse {
  data: PayableAccount[]
  summary: PayableAccountsSummary
}

export interface PayableAccountsCountsResponse {
  data: { paid: number; unpaid: number; paid_zero: number }
}

export async function fetchPayableAccounts(period: string): Promise<PayableAccountsListResponse> {
  return api.get("payable-accounts", {
    params: { period },
  }) as Promise<PayableAccountsListResponse>
}

export async function fetchPayableAccountsCounts(
  period: string,
): Promise<PayableAccountsCountsResponse> {
  return api.get("payable-accounts/counts", {
    params: { period },
  }) as Promise<PayableAccountsCountsResponse>
}

export async function createPayableAccount(name: string): Promise<PayableAccount> {
  const res = (await api.post("payable-accounts", { name })) as { data: PayableAccount }
  return res.data
}

export async function payPayableAccount(
  id: number,
  amount: number,
  period: string,
  payer_id: number | null,
): Promise<PayableAccount> {
  const res = (await api.post(`payable-accounts/${id}/payments`, { amount, period, payer_id })) as {
    data: PayableAccount
  }
  return res.data
}

export async function updatePayableAccountPayment(
  accountId: number,
  paymentId: number,
  amount: number,
  period: string,
  payer_id: number | null,
): Promise<void> {
  await api.put(`payable-accounts/${accountId}/payments/${paymentId}`, {
    amount,
    period,
    payer_id,
  })
}
