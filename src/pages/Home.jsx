
import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'

function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
          <Car /> CabGo
        </h1>

        <div className="flex gap-4">
          <Link to="/login" className="rounded-lg px-4 py-2 hover:text-yellow-400">
            Login
          </Link>
          <Link to="/signup" className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black">
            Sign Up
          </Link>
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
          Book your ride with ease. Travel comfortably and reach your destination safely.
        </p>

        <Link
          to="/login"
          className="mt-8 rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black hover:bg-yellow-300"
        >
          <Car className="mr-2 inline" size={20} />
          Book a Ride
        </Link>
      </main>
    </div>
  )
}

export default Home
