import { api } from "@/core/api/client"

export interface TransportCard {
  id: number
  name: string
  username: string
  card_number: string
  cpf: string
  created_at: string
  updated_at: string
}

export interface TransportCardBalanceResponse {
  balance: number
  updated_at: string
  from_cache: boolean
  card_number: string
  last_used_at?: string | null
  owner_name?: string | null
}

export interface TransportCardsListResponse {
  data: TransportCard[]
}

export async function fetchTransportCards(): Promise<TransportCard[]> {
  const res = (await api.get("transport-cards")) as TransportCardsListResponse
  return res.data
}

export async function fetchBalance(
  cardId: number,
  forceRefresh?: boolean,
): Promise<TransportCardBalanceResponse> {
  const params = forceRefresh ? { refresh: 1 } : undefined
  return api.get(`transport-cards/${cardId}/balance`, {
    params,
  }) as Promise<TransportCardBalanceResponse>
}

export async function refreshBalance(cardId: number): Promise<TransportCardBalanceResponse> {
  return api.post(`transport-cards/${cardId}/refresh`) as Promise<TransportCardBalanceResponse>
}

export interface CreateTransportCardPayload {
  name: string
  username: string
  password: string
  card_number: string
  cpf: string
}

export interface UpdateTransportCardPayload {
  name?: string
  username?: string
  password?: string
  card_number?: string
  cpf?: string
}

export async function createTransportCard(
  payload: CreateTransportCardPayload,
): Promise<TransportCard> {
  const res = (await api.post("transport-cards", payload)) as { data: TransportCard }
  return res.data
}

export async function updateTransportCard(
  id: number,
  payload: UpdateTransportCardPayload,
): Promise<TransportCard> {
  const res = (await api.put(`transport-cards/${id}`, payload)) as { data: TransportCard }
  return res.data
}

export async function deleteTransportCard(id: number): Promise<void> {
  await api.delete(`transport-cards/${id}`)
}
