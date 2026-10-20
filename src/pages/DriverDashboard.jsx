
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Car,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Flag,
  MapPin,
} from 'lucide-react'
import api from '../services/api'
import socket from '../services/socket'

export default function DriverDashboard() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [actionId, setActionId] = useState(null)
  const [sharingRideId, setSharingRideId] = useState(null)
  const [locationError, setLocationError] = useState('')
  const locationWatchRef = useRef(null)

  const fetchRides = async () => {
    try {
      setError('')

      const [availableResponse, driverResponse] = await Promise.all([
        api.get('/rides/available'),
        api.get('/rides/driver-rides'),
      ])

      const availableRides = availableResponse.data.rides || []
      const driverRides = driverResponse.data.rides || []

      const uniqueRides = new Map()

      ;[...availableRides, ...driverRides].forEach((ride) => {
        uniqueRides.set(ride.id, ride)
      })

      setRides(
        [...uniqueRides.values()].sort(
          (a, b) => Number(b.id) - Number(a.id)
        )
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Rides load nahi ho paayi. Driver account se login check karein.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRides()
  }, [])

  // Listen for real-time ride updates
  useEffect(() => {
    const handleRideUpdate = (data) => {
      const updatedRide = data?.ride

      if (!updatedRide?.id) return

      setRides((previousRides) =>
        previousRides.map((ride) =>
          String(ride.id) === String(updatedRide.id)
            ? { ...ride, ...updatedRide }
            : ride
        )
      )

      setNotice(
        data.message ||
          `Ride #${updatedRide.id} status updated: ${updatedRide.status}`
      )

      fetchRides()
    }

    const handleNewRideRequest = (data) => {
      setNotice(data?.message || 'A new ride request is available')
      fetchRides()
    }

    socket.on('ride-update', handleRideUpdate)
    socket.on('new-ride-request', handleNewRideRequest)

    return () => {
      socket.off('ride-update', handleRideUpdate)
      socket.off('new-ride-request', handleNewRideRequest)
    }
  }, [])

  // Join Socket.IO rooms for the driver's rides
  useEffect(() => {
    const joinRideRooms = () => {
      rides.forEach((ride) => {
        socket.emit('join-ride', ride.id)
      })
    }

    if (socket.connected) {
      joinRideRooms()
    }

    socket.on('connect', joinRideRooms)

    return () => {
      socket.off('connect', joinRideRooms)
    }
  }, [rides])

  // Accept, reject, start or complete a ride
  const handleRideAction = async (rideId, action) => {
    try {
      setActionId(rideId)
      setError('')
      setNotice('')

      const response = await api.patch(`/rides/${rideId}/${action}`)

      setNotice(
        response.data.message || 'Ride status updated successfully.'
      )

      // Stop GPS when the ride is completed or rejected
      if (['complete', 'reject'].includes(action)) {
        if (locationWatchRef.current !== null) {
          navigator.geolocation.clearWatch(locationWatchRef.current)
          locationWatchRef.current = null
        }

        setSharingRideId(null)
      }

      await fetchRides()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Action complete nahi hua. Dobara try karein.'
      )
    } finally {
      setActionId(null)
    }
  }

  // Start or stop live driver location sharing
  const handleLocationSharing = (rideId) => {
    if (!navigator.geolocation) {
      setLocationError(
        'Your browser does not support GPS location.'
      )
      return
    }

    // Stop sharing if this ride is already being tracked
    if (
      String(sharingRideId) === String(rideId) &&
      locationWatchRef.current !== null
    ) {
      navigator.geolocation.clearWatch(locationWatchRef.current)
      locationWatchRef.current = null
      setSharingRideId(null)
      setNotice('Live location sharing stopped.')
      return
    }

    // Stop any previous location tracking
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current)
      locationWatchRef.current = null
    }

    setLocationError('')
    setSharingRideId(rideId)
    setNotice('')

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit('driver-location-update', {
          rideId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })

        setLocationError('')
      },
      (gpsError) => {
        setLocationError(
          gpsError.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to get your location. Please try again.'
        )

        if (locationWatchRef.current !== null) {
          navigator.geolocation.clearWatch(locationWatchRef.current)
          locationWatchRef.current = null
        }

        setSharingRideId(null)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    )
  }

  // Clean up GPS tracking when the dashboard closes
  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
        locationWatchRef.current = null
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-400">
              CabGo Driver
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Driver Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Available requests aur apni active rides yahan dekhein.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true)
              fetchRides()
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            {notice}
          </div>
        )}

        {locationError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {locationError}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            Loading rides...
          </div>
        ) : rides.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <Car className="mx-auto mb-4 text-yellow-400" size={42} />
            <h2 className="text-xl font-semibold">No rides to show</h2>
            <p className="mt-2 text-slate-400">
              Abhi koi available ya active ride nahi hai. Refresh karke
              dobara check karein.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase text-yellow-400">
                    {ride.status}
                  </span>
                  <span className="text-sm text-slate-500">
                    Ride #{ride.id}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                      Rider Details
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {ride.rider_name || 'Rider name unavailable'}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                      Pickup
                    </p>
                    <p className="font-medium">{ride.pickup_address}</p>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-700 pl-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                      Drop-off
                    </p>
                    <p className="font-medium">{ride.dropoff_address}</p>
                  </div>

                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                      Estimated Fare
                    </p>

                    {ride.fare != null ? (
                      <p className="text-xl font-bold text-green-400">
                        ₹{Number(ride.fare).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Fare not calculated yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {ride.status === 'requested' && (
                    <>
                      <button
                        onClick={() =>
                          handleRideAction(ride.id, 'accept')
                        }
                        disabled={actionId !== null}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-slate-950 hover:bg-green-400 disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                        {actionId === ride.id ? 'Please wait...' : 'Accept'}
                      </button>

                      <button
                        onClick={() =>
                          handleRideAction(ride.id, 'reject')
                        }
                        disabled={actionId !== null}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        {actionId === ride.id ? 'Please wait...' : 'Reject'}
                      </button>
                    </>
                  )}

                  {ride.status === 'accepted' && (
                    <button
                      onClick={() =>
                        handleRideAction(ride.id, 'start')
                      }
                      disabled={actionId !== null}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
                    >
                      <Play size={18} />
                      {actionId === ride.id ? 'Please wait...' : 'Start Ride'}
                    </button>
                  )}

                  {ride.status === 'ongoing' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleLocationSharing(ride.id)}
                        disabled={
                          sharingRideId !== null &&
                          String(sharingRideId) !== String(ride.id)
                        }
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition disabled:opacity-50 ${
                          String(sharingRideId) === String(ride.id)
                            ? 'bg-red-600 text-white hover:bg-red-500'
                            : 'bg-blue-500 text-white hover:bg-blue-400'
                        }`}
                      >
                        <MapPin size={18} />
                        {String(sharingRideId) === String(ride.id)
                          ? 'Stop Live Location'
                          : 'Share Live Location'}
                      </button>

                      <button
                        onClick={() =>
                          handleRideAction(ride.id, 'complete')
                        }
                        disabled={actionId !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                      >
                        <Flag size={18} />
                        {actionId === ride.id
                          ? 'Please wait...'
                          : 'Complete Ride'}
                      </button>
                    </>
                  )}

                  {['completed', 'cancelled', 'rejected'].includes(
                    ride.status
                  ) && (
                    <p className="w-full text-center text-sm text-slate-400">
                      This ride is {ride.status}.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
