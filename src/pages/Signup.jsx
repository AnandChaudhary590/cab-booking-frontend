
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Car,
  User,
  Mail,
  Lock,
  ArrowLeft,
  Phone,
} from 'lucide-react'
import api from '../services/api'

function Signup() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
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
      const response = await api.post('/users', {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        password: formData.password,
      })

      setSuccess(true)
      setMessage(
        response.data.message || 'Account created successfully!'
      )

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
      })
    } catch (error) {
      setSuccess(false)

      setMessage(
        error.response?.data?.message ||
          'Unable to create account. Please try again.'
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
          className="mb-6 inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-400 text-black">
            <Car size={30} />
          </div>

          <h1 className="text-3xl font-bold">Create Account</h1>

          <p className="mt-2 text-gray-400">
            Join CabGo and start your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="mb-2 block text-sm text-gray-300"
            >
              Full Name
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-4">
              <User size={18} className="shrink-0 text-gray-500" />

              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                maxLength={100}
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-gray-300"
            >
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
                maxLength={255}
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm text-gray-300"
            >
              Phone Number (Optional)
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-4">
              <Phone size={18} className="shrink-0 text-gray-500" />

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                autoComplete="tel"
                maxLength={20}
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-gray-300"
            >
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
                placeholder="Create a password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-yellow-400 hover:text-yellow-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
