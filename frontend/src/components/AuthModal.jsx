import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        if (!formData.name.trim()) {
          setError('Name is required')
          setLoading(false)
          return
        }
        result = await register(formData.name, formData.email, formData.password)
      }

      if (result.success) {
        onClose()
        setFormData({ name: '', email: '', password: '' })
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({ name: '', email: '', password: '' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-dark-sidebar border border-dark-border rounded-lg p-5 sm:p-6 w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-dark-text-secondary hover:text-white hover:bg-dark-border rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 sm:py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent text-base"
                style={{ minHeight: '44px' }}
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 sm:py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent text-base"
              style={{ minHeight: '44px' }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 sm:py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent text-base"
              style={{ minHeight: '44px' }}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 sm:py-2 bg-accent hover:bg-accent-hover disabled:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors min-h-[44px]"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={switchMode}
            className="text-sm text-dark-text-secondary hover:text-accent transition-colors"
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
