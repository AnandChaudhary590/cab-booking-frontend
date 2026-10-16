
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cabgo_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(
    () => localStorage.getItem('cabgo_token')
  )

  const login = (userData, authToken) => {
    localStorage.setItem('cabgo_user', JSON.stringify(userData))
    localStorage.setItem('cabgo_token', authToken)

    setUser(userData)
    setToken(authToken)
  }

  const logout = () => {
    localStorage.removeItem('cabgo_user')
    localStorage.removeItem('cabgo_token')

    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: Boolean(user && token), login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
