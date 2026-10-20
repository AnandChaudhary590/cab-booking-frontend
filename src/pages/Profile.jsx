
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound, Mail, Phone, ShieldCheck, ArrowLeft, Save } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    })
  }, [user])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!form.full_name.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)

    try {
      const response = await api.patch('/users/me', {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      })

      const updatedUser = response.data.user

      localStorage.setItem('cabgo_user', JSON.stringify(updatedUser))

      setForm({
        full_name: updatedUser.full_name || '',
        phone: updatedUser.phone || '',
      })

      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-300 hover:text-yellow-400"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
          <div className="bg-yellow-400 p-6 text-gray-950">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gray-950 p-3 text-yellow-400">
                <UserRound size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-sm">Manage your CabGo account details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
            {message && (
              <div className="rounded-lg bg-green-900/40 p-3 text-green-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-900/40 p-3 text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Full Name
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-3">
                <UserRound size={18} className="text-yellow-400" />
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent py-3 outline-none"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3">
                <Mail size={18} className="text-gray-400" />
                <input
                  value={user?.email || ''}
                  readOnly
                  className="w-full cursor-not-allowed bg-transparent py-3 text-gray-400 outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed here.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Phone Number
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-3">
                <Phone size={18} className="text-yellow-400" />
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  className="w-full bg-transparent py-3 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-4">
              <ShieldCheck size={22} className="text-yellow-400" />
              <div>
                <p className="font-medium">Account Role</p>
                <p className="text-sm capitalize text-gray-400">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 font-bold text-gray-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg border border-red-500/50 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/10"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
