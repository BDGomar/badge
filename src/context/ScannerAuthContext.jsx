import { createContext, useContext, useEffect, useState } from 'react'
import { scannerApi, setScannerToken } from '../api/client'

const ScannerAuthContext = createContext(null)

export function ScannerAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('scanner_token')
    if (!token) {
      setLoading(false)
      return
    }

    scannerApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        setScannerToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await scannerApi.login(email, password)
    setScannerToken(res.token)
    setUser(res.user)
    return res.user
  }

  async function logout() {
    try {
      await scannerApi.logout()
    } catch {
      // ignore
    }
    setScannerToken(null)
    setUser(null)
  }

  return (
    <ScannerAuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </ScannerAuthContext.Provider>
  )
}

export function useScannerAuth() {
  const ctx = useContext(ScannerAuthContext)
  if (!ctx) throw new Error('useScannerAuth must be used within ScannerAuthProvider')
  return ctx
}
