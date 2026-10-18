import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import RideMap from '../components/RideMap'

function RideBooking() {
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [pickupCoordinates, setPickupCoordinates] = useState(null)
const [dropoffCoordinates, setDropoffCoordinates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [routeInfo, setRouteInfo] = useState(null)

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

      if (!pickupCoordinates || !dropoffCoordinates) {
  setError('Please select both pickup and destination on the map.')
  return
}

const response = await api.post('/rides', {
  pickup_address: pickupAddress.trim(),
  dropoff_address: dropoffAddress.trim(),
  pickup_lat: pickupCoordinates.lat,
  pickup_lng: pickupCoordinates.lng,
  dropoff_lat: dropoffCoordinates.lat,
  dropoff_lng: dropoffCoordinates.lng,
})

      setMessage(
        `Ride booked successfully! Booking ID: ${response.data.ride.id}`
      )

      setPickupAddress('')
      setDropoffAddress('')
      setPickupCoordinates(null)
      setDropoffCoordinates(null)
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
      <div className="mx-auto max-w-3xl">
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
            Select your pickup and destination on the map, or enter the
            addresses below.
          </p>

          {/* Interactive Map */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-700">
            
<RideMap
  onLocationSelect={async (mode, coordinates) => {
  setError('')

  const { lat, lng } = coordinates

  if (mode === 'pickup') {
    setPickupCoordinates(coordinates)
  } else {
    setDropoffCoordinates(coordinates)
  }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      )

      if (!response.ok) {
        throw new Error('Address lookup failed')
      }

      const data = await response.json()
      const address =
        data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`

      if (mode === 'pickup') {
        setPickupAddress(address)
      } else {
        setDropoffAddress(address)
      }
    } catch {
      const address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`

      if (mode === 'pickup') {
        setPickupAddress(address)
      } else {
        setDropoffAddress(address)
      }

      setError('Address lookup failed. Please check the address manually.')
    }
  }}
  onRouteCalculated={setRouteInfo}
/>

          </div>

          <p className="mt-2 text-sm text-gray-400">
            Select Pickup or Select Destination, then click the map to place
            the marker. Enter the corresponding addresses below.
          </p>
        
        {routeInfo && (
  <div className="mt-5 rounded-xl border border-yellow-400/30 bg-gray-800 p-5">
    <h2 className="text-lg font-bold text-yellow-400">
      Estimated Ride Fare
    </h2>

    <p className="mt-3 text-sm text-gray-300">
      Distance: {routeInfo.distanceKm.toFixed(2)} km
    </p>

    <p className="mt-1 text-sm text-gray-300">
      Estimated time: {routeInfo.durationMinutes} minutes
    </p>

    <p className="mt-3 text-3xl font-bold text-white">
      ₹{Math.max(70, Math.round(50 + routeInfo.distanceKm * 12))}
    </p>

    <p className="mt-2 text-xs text-gray-400">
      Estimate based on ₹50 base fare + ₹12/km, with a ₹70 minimum.
      Final fare may vary.
    </p>
  </div>
)}
          {/* Booking Form */}
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
                placeholder="e.g. Railway Station, Auraiya"
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
                placeholder="e.g. Bus Stand, Auraiya"
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-950 p-3 text-red-300"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg bg-green-950 p-3 text-green-300"
              >
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
