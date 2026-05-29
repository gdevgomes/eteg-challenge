import { useState, useCallback, type ReactNode } from 'react'
import { login as apiLogin } from '../services/api'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'access_token'

// Valida o JWT no cliente checando o claim `exp` (a assinatura é validada no
// backend). Retorna false se o token estiver ausente, malformado ou expirado.
function isTokenValid(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const { exp } = JSON.parse(atob(padded)) as { exp?: number }
    return typeof exp === 'number' && exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (isTokenValid(stored)) return stored
    localStorage.removeItem(TOKEN_KEY)
    return null
  })

  const login = useCallback(async (payload: Parameters<typeof apiLogin>[0]) => {
    const { access_token } = await apiLogin(payload)
    localStorage.setItem(TOKEN_KEY, access_token)
    setToken(access_token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: isTokenValid(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
