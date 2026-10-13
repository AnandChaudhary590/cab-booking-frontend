
import { Link } from 'react-router-dom'
import { Car, User, Mail, Lock, ArrowLeft } from 'lucide-react'

function Signup() {
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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-gray-300">
              Full Name
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-4">
              <User size={18} className="text-gray-500" />
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-950 px-4">
              <Mail size={18} className="text-gray-500" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
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
              <Lock size={18} className="text-gray-500" />
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                required
                minLength={8}
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-300"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-yellow-400 hover:text-yellow-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
