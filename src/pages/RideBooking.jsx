import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function RideBooking() {
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleBookRide = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      setError('Please enter both pickup and drop-off addresses.')
      return
    }

    if (!localStorage.getItem('cabgo_token')) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/rides', {
        pickup_address: pickupAddress.trim(),
        dropoff_address: dropoffAddress.trim(),
      })

      setMessage(
        `Ride booked successfully! Booking ID: ${response.data.ride.id}`
      )
      setPickupAddress('')
      setDropoffAddress('')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not book your ride. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 text-sm text-yellow-400 hover:text-yellow-300"
        >
          ← Back to Home
        </button>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-yellow-400">
            Book Your Ride
          </h1>
          <p className="mt-2 text-gray-400">
            Enter your pickup and destination.
          </p>

          <form onSubmit={handleBookRide} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="pickup"
                className="mb-2 block text-sm font-medium"
              >
                Pickup Location
              </label>
              <input
                id="pickup"
                type="text"
                maxLength={500}
                value={pickupAddress}
                onChange={(event) => setPickupAddress(event.target.value)}
                placeholder="e.g. Railway Station, Shamli"
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label
                htmlFor="dropoff"
                className="mb-2 block text-sm font-medium"
              >
                Drop-off Location
              </label>
              <input
                id="dropoff"
                type="text"
                maxLength={500}
                value={dropoffAddress}
                onChange={(event) => setDropoffAddress(event.target.value)}
                placeholder="e.g. Bus Stand, Shamli"
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-300">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="rounded-lg bg-green-950 p-3 text-green-300">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Booking...' : 'Book Ride'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RideBooking