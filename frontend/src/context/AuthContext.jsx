import { createContext, useState, useContext, useEffect } from 'react'
import { getApiUrl } from '../config/api'

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

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
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
