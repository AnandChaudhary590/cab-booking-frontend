
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import socket from '../services/socket'

function MapUpdater({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, 15)
    }
  }, [map, position])

  return null
}

function LiveDriverMap({ ride }) {
  const [driverLocation, setDriverLocation] = useState(null)
  const [socketStatus, setSocketStatus] = useState(
    socket.connected ? 'Connected' : 'Connecting...'
  )

  const pickup = [
    Number(ride.pickup_lat),
    Number(ride.pickup_lng),
  ]

  const destination = [
    Number(ride.dropoff_lat),
    Number(ride.dropoff_lng),
  ]

  useEffect(() => {
    const joinRoom = () => {
      console.log('Rider joining ride room:', ride.id)
      socket.emit('join-ride', ride.id)
      setSocketStatus('Connected')
    }

    const handleConnect = () => {
      setSocketStatus('Connected')
      joinRoom()
    }

    const handleDisconnect = () => {
      setSocketStatus('Disconnected')
    }

    const handleDriverLocation = (data) => {
      console.log('Rider received driver location:', data)

      if (String(data?.rideId) !== String(ride.id)) {
        console.log('Ignoring location for another ride')
        return
      }

      const lat = Number(data.latitude)
      const lng = Number(data.longitude)

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        setDriverLocation([lat, lng])
      }
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('driver-location-update', handleDriverLocation)

    if (socket.connected) {
      joinRoom()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('driver-location-update', handleDriverLocation)
    }
  }, [ride.id])

  const validCoordinates = [...pickup, ...destination].every(
    Number.isFinite
  ) &&
    Math.abs(pickup[0]) <= 90 &&
    Math.abs(pickup[1]) <= 180 &&
    Math.abs(destination[0]) <= 90 &&
    Math.abs(destination[1]) <= 180

  if (!validCoordinates) {
    return (
      <div className="mt-5 rounded-xl border border-yellow-700 bg-gray-900 p-4 text-yellow-300">
        Map location is unavailable for this ride.
      </div>
    )
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-gray-700">
      <div className="bg-gray-800 px-4 py-3 font-semibold text-yellow-400">
        Live Driver Tracking
      </div>

      <MapContainer
        center={driverLocation || pickup}
        zoom={12}
        scrollWheelZoom
        style={{ height: '320px', width: '100%' }}
      >
        <MapUpdater position={driverLocation} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={pickup}>
          <Popup>Pickup Location</Popup>
        </Marker>

        <Marker position={destination}>
          <Popup>Drop-off Location</Popup>
        </Marker>

        <Polyline
          positions={[pickup, destination]}
          pathOptions={{ color: '#eab308', weight: 4 }}
        />

        {driverLocation && (
          <Marker position={driverLocation}>
            <Popup>Driver's Current Location</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="bg-gray-800 px-4 py-3 text-sm text-gray-300">
        <p>Socket: {socketStatus}</p>
        <p>
          {driverLocation
            ? `Driver location received: ${driverLocation[0].toFixed(5)}, ${driverLocation[1].toFixed(5)}`
            : 'Waiting for the driver location...'}
        </p>
      </div>
    </div>
  )
}

export default LiveDriverMap
