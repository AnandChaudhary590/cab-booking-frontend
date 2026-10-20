
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Car,
  ArrowLeft,
  RefreshCw,
  Calculator,
  XCircle,
  CreditCard,
} from 'lucide-react'
import api from '../services/api'
import socket from '../services/socket'
import LiveDriverMap from '../components/LiveDriverMap'

function MyRides() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [distanceInputs, setDistanceInputs] = useState({})
  const [calculatingId, setCalculatingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [paymentMethods, setPaymentMethods] = useState({})
  const [payments, setPayments] = useState({})
  const [payingId, setPayingId] = useState(null)

  const fetchRides = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/rides/my-rides')
      const rideList = response.data.rides || []
      setRides(rideList)

      // Load previously created payment records
      const completedRides = rideList.filter(
        (ride) => ride.status === 'completed'
      )

      const paymentResults = await Promise.allSettled(
        completedRides.map(async (ride) => {
          const response = await api.get(`/payments/${ride.id}`)
          return { rideId: ride.id, payment: response.data.payment }
        })
      )

      const savedPayments = {}
      paymentResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          savedPayments[result.value.rideId] = result.value.payment
        }
      })

      setPayments((previous) => ({ ...previous, ...savedPayments }))
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load your rides. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRides()
  }, [])

  useEffect(() => {
    const handleRideUpdate = (data) => {
      const updatedRide = data?.ride
      if (!updatedRide?.id) return

      setRides((previous) =>
        previous.map((ride) =>
          String(ride.id) === String(updatedRide.id)
            ? { ...ride, ...updatedRide }
            : ride
        )
      )

      setNotice(
        data.message ||
          `Booking #${updatedRide.id} status updated: ${updatedRide.status}`
      )
    }

    socket.on('ride-update', handleRideUpdate)
    return () => socket.off('ride-update', handleRideUpdate)
  }, [])

  useEffect(() => {
    const joinRideRooms = () => {
      rides.forEach((ride) => socket.emit('join-ride', ride.id))
    }

    if (socket.connected) joinRideRooms()
    socket.on('connect', joinRideRooms)

    return () => socket.off('connect', joinRideRooms)
  }, [rides])

  const handleCalculateFare = async (rideId) => {
    const distance = Number(distanceInputs[rideId])

    if (!Number.isFinite(distance) || distance <= 0 || distance > 1000) {
      setError('Distance 0 se zyada aur 1000 km ya usse kam honi chahiye.')
      setNotice('')
      return
    }

    try {
      setCalculatingId(rideId)
      setError('')
      setNotice('')

      const response = await api.patch(`/rides/${rideId}/fare`, {
        distance_km: distance,
      })

      const updatedRide = response.data.ride

      setRides((previous) =>
        previous.map((ride) =>
          String(ride.id) === String(rideId)
            ? { ...ride, ...updatedRide }
            : ride
        )
      )

      setNotice(
        `Ride #${rideId} ka fare calculate ho gaya: ₹${Number(
          response.data.fare_breakdown.total_fare
        ).toFixed(2)}`
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Fare calculate nahi hua. Dobara try karein.'
      )
    } finally {
      setCalculatingId(null)
    }
  }

  const handleCancelRide = async (rideId) => {
    const confirmed = window.confirm(
      `Kya aap Booking #${rideId} cancel karna chahte hain?`
    )

    if (!confirmed) return

    try {
      setCalculatingId(rideId)
      setError('')
      setNotice('')

      const response = await api.patch(`/rides/${rideId}/cancel`)

      setRides((previous) =>
        previous.map((ride) =>
          String(ride.id) === String(rideId)
            ? { ...ride, ...response.data.ride }
            : ride
        )
      )

      setNotice(response.data.message || 'Ride cancelled successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Ride cancel nahi hui. Dobara try karein.'
      )
    } finally {
      setCalculatingId(null)
    }
  }

  const handlePayment = async (ride) => {
    const paymentMethod = paymentMethods[ride.id]

    if (!paymentMethod) {
      setError('Please select Cash or UPI.')
      setNotice('')
      return
    }

    try {
      setPayingId(ride.id)
      setError('')
      setNotice('')

      const response = await api.post('/payments', {
        rideId: ride.id,
        paymentMethod,
      })

      if (response.data.payment) {
        setPayments((previous) => ({
          ...previous,
          [ride.id]: response.data.payment,
        }))
      }

      setNotice(
        response.data.message || 'Payment record created successfully.'
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Payment record create nahi hua. Dobara try karein.'
      )
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 sm:text-4xl">
              My Rides
            </h1>
            <p className="mt-2 text-gray-400">
              View rides, calculate fares and manage payments.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRides}
            disabled={loading || calculatingId !== null || payingId !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 hover:border-yellow-400 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900 bg-gray-900 p-4 text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-xl border border-green-800 bg-green-950/50 p-4 text-green-300">
            {notice}
          </div>
        )}

        {loading ? (
          <p className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-300">
            Loading your rides...
          </p>
        ) : rides.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <Car className="mx-auto text-yellow-400" size={40} />
            <h2 className="mt-4 text-xl font-semibold">No rides yet</h2>
            <p className="mt-2 text-gray-400">
              Book your first ride to see it here.
            </p>
            <Link
              to="/book-ride"
              className="mt-5 inline-block rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300"
            >
              Book a Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Total bookings: {rides.length}
            </p>

            {rides.map((ride) => (
              <article
                key={ride.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold">Booking #{ride.id}</h2>

                  <span
                    className={`rounded-full border px-3 py-1 text-sm capitalize ${
                      ride.status === 'accepted'
                        ? 'border-green-700 bg-green-950 text-green-300'
                        : ride.status === 'rejected' ||
                            ride.status === 'cancelled'
                          ? 'border-red-700 bg-red-950 text-red-300'
                          : ride.status === 'completed'
                            ? 'border-blue-700 bg-blue-950 text-blue-300'
                            : ride.status === 'ongoing'
                              ? 'border-purple-700 bg-purple-950 text-purple-300'
                              : 'border-yellow-700 bg-yellow-950 text-yellow-300'
                    }`}
                  >
                    {ride.status}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Pickup</p>
                      <p className="break-words">{ride.pickup_address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Drop-off</p>
                      <p className="break-words">{ride.dropoff_address}</p>
                    </div>
                  </div>
                </div>

                {ride.status === 'ongoing' && <LiveDriverMap ride={ride} />}

                {ride.driver_id != null && (
                  <p className="mt-4 text-sm text-gray-400">
                    Driver ID: <span className="text-white">{ride.driver_id}</span>
                  </p>
                )}

                {ride.status === 'accepted' && (
                  <div className="mt-5 rounded-xl border border-yellow-700/40 bg-yellow-400/5 p-4">
                    <label
                      htmlFor={`distance-${ride.id}`}
                      className="mb-2 block text-sm font-medium text-gray-200"
                    >
                      Ride distance (km)
                    </label>

                    <input
                      id={`distance-${ride.id}`}
                      type="number"
                      min="0.1"
                      max="1000"
                      step="0.1"
                      placeholder="e.g. 12.5"
                      value={distanceInputs[ride.id] ?? ''}
                      onChange={(event) =>
                        setDistanceInputs((previous) => ({
                          ...previous,
                          [ride.id]: event.target.value,
                        }))
                      }
                      disabled={calculatingId !== null}
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    />

                    <button
                      type="button"
                      onClick={() => handleCalculateFare(ride.id)}
                      disabled={calculatingId !== null}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
                    >
                      <Calculator size={18} />
                      {calculatingId === ride.id ? 'Calculating...' : 'Calculate Fare'}
                    </button>
                  </div>
                )}

                {['requested', 'accepted'].includes(ride.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancelRide(ride.id)}
                    disabled={calculatingId !== null}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-700 px-4 py-3 font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    {calculatingId === ride.id ? 'Please wait...' : 'Cancel Ride'}
                  </button>
                )}

                {ride.status === 'completed' && (
                  <div className="mt-5 rounded-xl border border-yellow-700/40 bg-yellow-400/5 p-4">
                    <h3 className="flex items-center gap-2 font-semibold text-yellow-400">
                      <CreditCard size={20} />
                      Ride Payment
                    </h3>

                    <p className="mt-2 text-sm text-gray-300">
                      Amount:{' '}
                      <span className="font-bold text-white">
                        {ride.fare == null
                          ? 'Fare unavailable'
                          : `₹${Number(ride.fare).toFixed(2)}`}
                      </span>
                    </p>

                    {payments[ride.id] ? (
                      <div className="mt-3 rounded-lg bg-gray-950 p-3">
                        <p className="text-sm text-gray-300">
                          Method:{' '}
                          <span className="capitalize text-white">
                            {payments[ride.id].payment_method}
                          </span>
                        </p>
                        <p className="mt-1 text-sm">
                          Status:{' '}
                          <span className="font-semibold capitalize text-yellow-400">
                            {payments[ride.id].payment_status}
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Payment record only. A real transaction has not been verified.
                        </p>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor={`payment-${ride.id}`}
                          className="mt-3 block text-sm text-gray-300"
                        >
                          Select payment method
                        </label>

                        <select
                          id={`payment-${ride.id}`}
                          value={paymentMethods[ride.id] || ''}
                          onChange={(event) =>
                            setPaymentMethods((previous) => ({
                              ...previous,
                              [ride.id]: event.target.value,
                            }))
                          }
                          disabled={payingId !== null || ride.fare == null}
                          className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                        >
                          <option value="">Choose method</option>
                          <option value="cash">Cash</option>
                          <option value="upi">UPI (Demo)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handlePayment(ride)}
                          disabled={
                            payingId !== null ||
                            ride.fare == null ||
                            !paymentMethods[ride.id]
                          }
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CreditCard size={18} />
                          {payingId === ride.id
                            ? 'Processing...'
                            : 'Create Payment Record'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-gray-800 pt-4 text-sm">
                  <p className="text-gray-400">
                    Booked:{' '}
                    {ride.created_at
                      ? new Date(ride.created_at).toLocaleString()
                      : 'Date unavailable'}
                  </p>

                  <p>
                    Fare:{' '}
                    {ride.fare == null ? (
                      <span className="text-gray-400">Not calculated</span>
                    ) : (
                      <span className="font-bold text-green-400">
                        ₹{Number(ride.fare).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRides
