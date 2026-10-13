
import { Link } from 'react-router-dom'
import { Car, Mail, Lock, ArrowLeft } from 'lucide-react'

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
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
                placeholder="Enter your password"
                required
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-300"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-yellow-400 hover:text-yellow-300">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
