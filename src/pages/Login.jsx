
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await api.post('/users/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      const { token, user } = response.data

      if (!token || !user) {
        throw new Error('Invalid login response from server')
      }

      login(user, token)
      setSuccess(true)
      setMessage('Login successful!')

     if (user.role === 'driver') {
  navigate('/driver-dashboard', { replace: true })
} else {
  navigate('/', { replace: true })
}
    } catch (error) {
      setSuccess(false)
      setMessage(
        error.response?.data?.message ||
          error.message ||
          'Unable to login. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-8 text-white">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-400 text-black">
            <Car size={30} />
          </div>

          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-400">
            Login to continue your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-4">
              <Mail size={18} className="shrink-0 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-4">
              <Lock size={18} className="shrink-0 text-gray-500" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-lg p-3 text-sm ${
                success
                  ? 'bg-green-950 text-green-300'
                  : 'bg-red-950 text-red-300'
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-yellow-400 hover:text-yellow-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
