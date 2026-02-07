import { createContext, useState, useContext, useEffect } from 'react'
import { getApiUrl } from '../config/api'
import { supabase, isSupabaseConfigured } from '../config/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Handle magic link callback: user clicked link in email (token_hash in URL)
  useEffect(() => {
    const handleMagicLinkCallback = async () => {
      if (!isSupabaseConfigured()) return
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')
      if (!tokenHash || type !== 'email') return

      try {
        const { data: authData, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        })
        if (error) throw new Error(error.message)
        const accessToken = authData?.session?.access_token
        if (!accessToken) throw new Error('No session after magic link')
        const response = await fetch(getApiUrl('/api/auth/supabase-login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Login failed')
        localStorage.setItem('token', data.token)
        setToken(data.token)
        setUser(data.user)
        // Remove token_hash and type from URL so the app shows clean URL
        const url = new URL(window.location.href)
        url.searchParams.delete('token_hash')
        url.searchParams.delete('type')
        window.history.replaceState({}, '', url.pathname + url.search)
      } catch (err) {
        console.error('Magic link login error:', err)
      } finally {
        setLoading(false)
      }
    }
    handleMagicLinkCallback()
  }, [])

  // Check if user is logged in on mount (skip if we're handling magic link)
  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get('token_hash') && params.get('type') === 'email') {
        setLoading(false)
        return
      }
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const response = await fetch(getApiUrl('/api/auth/me'), {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          })
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setToken(storedToken)
          } else {
            localStorage.removeItem('token')
            setToken(null)
          }
        } catch (error) {
          console.error('Auth check error:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const sendOtp = async (email) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: { shouldCreateUser: true },
        })
        if (error) throw new Error(error.message)
        return { success: true }
      }
      const response = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const verifyOtp = async (email, otp) => {
    try {
      if (isSupabaseConfigured()) {
        const { data: authData, error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: String(otp).trim(),
          type: 'email',
        })
        if (error) throw new Error(error.message)
        const accessToken = authData?.session?.access_token
        if (!accessToken) throw new Error('No session after OTP verify')
        const response = await fetch(getApiUrl('/api/auth/supabase-login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Login failed')
        localStorage.setItem('token', data.token)
        setToken(data.token)
        setUser(data.user)
        return { success: true }
      }
      const response = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: String(otp).trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Invalid OTP')
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    sendOtp,
    verifyOtp,
    logout,
    isAuthenticated: !!user,
    getAuthHeaders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
