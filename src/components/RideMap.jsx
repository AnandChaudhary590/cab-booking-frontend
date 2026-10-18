
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from 'react-leaflet'

function MapClickHandler({ selectionMode, onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect(selectionMode, {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  return null
}

function RouteViewer({ routeCoordinates }) {
  const map = useMap()

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      map.fitBounds(routeCoordinates, { padding: [30, 30] })
    }
  }, [routeCoordinates, map])

  return routeCoordinates.length > 0 ? (
    <Polyline
      positions={routeCoordinates}
      pathOptions={{ color: '#facc15', weight: 5 }}
    />
  ) : null
}

function RideMap({ onLocationSelect, onRouteCalculated }) {
  const [selectionMode, setSelectionMode] = useState('pickup')
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState('')

  const handleLocationSelect = (mode, coordinates) => {
    if (mode === 'pickup') {
      setPickup(coordinates)
    } else {
      setDestination(coordinates)
    }

    setRouteInfo(null)
    setRouteCoordinates([])
    setRouteError('')
    onRouteCalculated?.(null)
    onLocationSelect?.(mode, coordinates)
  }

  useEffect(() => {
    if (!pickup || !destination) return

    const controller = new AbortController()

    async function calculateRoute() {
      setRouteLoading(true)
      setRouteError('')
      setRouteInfo(null)
      setRouteCoordinates([])
      onRouteCalculated?.(null)

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}` +
          '?overview=full&geometries=geojson'

        const response = await fetch(url, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Route service is unavailable.')
        }

        const data = await response.json()

        if (data.code !== 'Ok' || !data.routes?.length) {
          throw new Error('No driving route found between these locations.')
        }

        const route = data.routes[0]

        const info = {
          distanceKm: route.distance / 1000,
          durationMinutes: Math.ceil(route.duration / 60),
        }

        const coordinates = route.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        )

        setRouteCoordinates(coordinates)
        setRouteInfo(info)
        onRouteCalculated?.(info)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRouteError(
            error.message || 'Could not calculate the road route.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false)
        }
      }
    }

    calculateRoute()

    return () => controller.abort()
  }, [pickup, destination, onRouteCalculated])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectionMode('pickup')}
          className={`rounded-lg px-4 py-2 font-medium ${
            selectionMode === 'pickup'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-800 text-white'
          }`}
        >
          Select Pickup
        </button>

        <button
          type="button"
          onClick={() => setSelectionMode('destination')}
          className={`rounded-lg px-4 py-2 font-medium ${
            selectionMode === 'destination'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-800 text-white'
          }`}
        >
          Select Destination
        </button>
      </div>

      <MapContainer
        center={[26.4652, 79.5092]}
        zoom={10}
        scrollWheelZoom
        style={{ height: '350px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          selectionMode={selectionMode}
          onLocationSelect={handleLocationSelect}
        />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        <RouteViewer routeCoordinates={routeCoordinates} />
      </MapContainer>

      <div className="space-y-1 text-sm text-gray-300">
        <p>
          <span className="font-semibold text-yellow-400">Pickup:</span>{' '}
          {pickup
            ? `${pickup.lat.toFixed(5)}, ${pickup.lng.toFixed(5)}`
            : 'Select pickup on the map'}
        </p>

        <p>
          <span className="font-semibold text-yellow-400">Destination:</span>{' '}
          {destination
            ? `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`
            : 'Select destination on the map'}
        </p>
      </div>

      {routeLoading && (
        <p role="status" className="text-sm text-yellow-400">
          Calculating road route...
        </p>
      )}

      {routeError && (
        <p role="alert" className="text-sm text-red-400">
          {routeError}
        </p>
      )}

      {routeInfo && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4">
          <div>
            <p className="text-sm text-gray-400">Road Distance</p>
            <p className="text-xl font-bold text-yellow-400">
              {routeInfo.distanceKm.toFixed(2)} km
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Estimated Drive</p>
            <p className="text-xl font-bold text-yellow-400">
              {routeInfo.durationMinutes} min
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Travel time is an estimate and does not include live traffic.
      </p>
    </div>
  )
}

export default RideMap
