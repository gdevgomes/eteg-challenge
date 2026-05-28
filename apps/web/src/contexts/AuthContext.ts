import { createContext } from 'react'
import type { LoginPayload } from '../services/api'

export interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
