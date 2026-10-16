
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, UserCircle, LogOut } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const [apiStatus, setApiStatus] = useState('Checking backend...')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health')
        setApiStatus(response.data.message)
      } catch (error) {
        console.error('Backend connection failed:', error.message)
        setApiStatus('Backend connection failed')
      }
    }

    checkBackend()
  }, [])

  const isConnected = apiStatus === 'Cab Booking Backend is healthy!'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-yellow-400"
        >
          <Car />
          CabGo
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-300">
                Hi, {user?.full_name}
              </span>

              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 hover:text-yellow-400"
              >
                <UserCircle size={18} />
                My Profile
              </Link>

              {user?.role === 'rider' && (
                <Link
                  to="/my-rides"
                  className="rounded-lg border border-gray-700 px-4 py-2 hover:border-yellow-400 hover:text-yellow-400"
                >
                  My Rides
                </Link>
              )}

              {user?.role === 'driver' && (
                <Link
                  to="/driver-dashboard"
                  className="rounded-lg border border-gray-700 px-4 py-2 hover:border-yellow-400 hover:text-yellow-400"
                >
                  Driver Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 hover:text-yellow-400"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 font-semibold uppercase tracking-widest text-yellow-400">
          Your journey starts here
        </p>

        <h2 className="max-w-3xl text-5xl font-extrabold leading-tight md:text-7xl">
          Your Ride, Your Journey.
        </h2>

        <p className="mt-6 max-w-xl text-gray-400">
          Book your ride with ease. Travel comfortably and reach your
          destination safely.
        </p>

        {user?.role === 'driver' ? (
          <Link
            to="/driver-dashboard"
            className="mt-8 rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black hover:bg-yellow-300"
          >
            <Car className="mr-2 inline" size={20} />
            Open Driver Dashboard
          </Link>
        ) : (
          <Link
            to={isAuthenticated ? '/book-ride' : '/login'}
            className="mt-8 rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black hover:bg-yellow-300"
          >
            <Car className="mr-2 inline" size={20} />
            {isAuthenticated ? 'Book a Ride' : 'Login to Book a Ride'}
          </Link>
        )}

        <div className="mt-8 rounded-lg border border-gray-800 px-5 py-3">
          <p className="text-sm text-gray-400">Backend Status</p>

          <p
            className={`mt-1 text-sm font-semibold ${
              isConnected
                ? 'text-green-400'
                : apiStatus === 'Checking backend...'
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {apiStatus}
          </p>
        </div>
      </main>
    </div>
  )
}

export default Home
