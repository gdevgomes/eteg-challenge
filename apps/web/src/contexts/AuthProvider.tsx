import { useState, useCallback, type ReactNode } from 'react'
import { login as apiLogin } from '../services/api'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'access_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

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
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
