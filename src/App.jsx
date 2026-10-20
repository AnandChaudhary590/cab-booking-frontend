
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RideBooking from './pages/RideBooking'
import MyRides from './pages/MyRides'
import DriverDashboard from './pages/DriverDashboard'
import Profile from './pages/Profile'
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
