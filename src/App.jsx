
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RideBooking from './pages/RideBooking'
import MyRides from './pages/MyRides'
import DriverDashboard from './pages/DriverDashboard'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'driver' ? '/driver-dashboard' : '/'}
        replace
      />
    )
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/book-ride"
        element={
          <ProtectedRoute allowedRoles={['rider']}>
            <RideBooking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-rides"
        element={
          <ProtectedRoute allowedRoles={['rider']}>
            <MyRides />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver-dashboard"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Profile() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-800 bg-gray-900 p-8">
        <h1 className="text-3xl font-bold text-yellow-400">My Profile</h1>

        <p className="mt-6">
          <span className="text-gray-400">Name:</span> {user?.full_name}
        </p>

        <p className="mt-3">
          <span className="text-gray-400">Email:</span> {user?.email}
        </p>

        <p className="mt-3">
          <span className="text-gray-400">Role:</span> {user?.role}
        </p>

        <button
          onClick={logout}
          className="mt-8 rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
