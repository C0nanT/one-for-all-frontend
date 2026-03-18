import { api } from "@/core/api/client"

export interface TransportCardBalanceResponse {
  balance: number
  updated_at: string
  from_cache: boolean
  card_number: string
  last_used_at?: string | null
  owner_name?: string | null
}

export async function fetchBalance(forceRefresh?: boolean): Promise<TransportCardBalanceResponse> {
  const params = forceRefresh ? { refresh: 1 } : undefined
  return api.get("transport-card/balance", { params }) as Promise<TransportCardBalanceResponse>
}

export async function refreshBalance(): Promise<TransportCardBalanceResponse> {
  return api.post("transport-card/refresh") as Promise<TransportCardBalanceResponse>
}
