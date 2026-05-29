const BASE_URL = 'http://localhost:3000'

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body.message ?? 'Erro desconhecido')
  }

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export interface Color {
  id: string
  name: string
  hex: string
}

export interface Customer {
  id: string
  fullName: string
  cpfStart: string
  cpfEnd: string
  email: string
  notes: string | null
  color: Color
  createdAt: string
  updatedAt: string
}

export interface PaginatedCustomers {
  data: Customer[]
  total: number
  page: number
  limit: number
}

export interface LoginPayload {
  username: string
  password: string
}

export function login(payload: LoginPayload): Promise<{ access_token: string }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getColors(): Promise<Color[]> {
  return apiFetch('/colors')
}

export interface CreateCustomerPayload {
  fullName: string
  cpf: string
  email: string
  colorId: string
  notes?: string
}

export interface UpdateCustomerPayload {
  cpf: string
  fullName: string
  email: string
  colorId: string
  notes?: string
}

export interface LookupCustomerPayload {
  cpf: string
}

export function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  return apiFetch('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCustomers(page = 1, limit = 20): Promise<PaginatedCustomers> {
  return apiFetch(`/customers?page=${page}&limit=${limit}`)
}

export function updateCustomer(payload: UpdateCustomerPayload): Promise<Customer> {
  return apiFetch('/customers', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function lookupCustomer(payload: LookupCustomerPayload): Promise<Customer> {
  return apiFetch('/customers/lookup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
