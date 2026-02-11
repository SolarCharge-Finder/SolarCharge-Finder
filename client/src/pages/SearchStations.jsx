import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import MapView from '../components/map/MapView'
import SearchSidebar from '../components/search/SearchSidebar'
import '../styles/searchStations.css'

// ===== TEMP MOCK DATA (REMOVE AFTER STATION MODULE INTEGRATION) =====
const mockStations = [
  {
    id: 1,
    name: 'Colombo Solar Station',
    lat: 6.9271,
    lng: 79.8612,
    rating: 4.5,
    address: 'Colombo 03',
    distance: 2.1,
  },
  {
    id: 2,
    name: 'Kandy Green Charge Hub',
    lat: 7.2906,
    lng: 80.6337,
    rating: 4.2,
    address: 'Kandy Town',
    distance: 8.4,
  },
  {
    id: 3,
    name: 'Galle Solar Supercharger',
    lat: 6.0535,
    lng: 80.2209,
    rating: 4.8,
    address: 'Galle Fort',
    distance: 12.7,
  },
]

function SearchStations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStation, setSelectedStation] = useState(mockStations[0])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const filteredStations = useMemo(() => {
    if (!searchTerm) return mockStations
    return mockStations.filter((station) =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocationLoading(false)
        setLocationError('')
      },
      (error) => {
        console.error('Location error', error)
        setLocationError('Unable to fetch your location. Please allow location access.')
        setLocationLoading(false)
      },
    )
  }

  useEffect(() => {
    detectLocation()
  }, [])

  useEffect(() => {
    if (!filteredStations.find((station) => station.id === selectedStation?.id)) {
      setSelectedStation(filteredStations[0] ?? null)
    }
  }, [filteredStations, selectedStation])

  const handleSelectStation = (station) => {
    setSelectedStation(station)
  }

  return (
    <div className="search-stations-root">
      <Navbar />
      <section className="search-stations-wrapper">
        <header className="search-stations-header">
          <div>
            <p className="eyebrow">Live Station Explorer</p>
            <h1>Find nearby solar charging stations</h1>
            <p>Search by city or name, then follow the route preview to start charging sustainably.</p>
          </div>
          <div className="header-meta">
            <span className="pill">{filteredStations.length} stations available</span>
            <span className="pill pill--ghost">{currentLocation ? 'Location detected' : 'Awaiting location'}</span>
          </div>
        </header>
        <div className="search-stations-page">
          <SearchSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onUseCurrentLocation={detectLocation}
            locationLoading={locationLoading}
            locationError={locationError}
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            onDirections={handleSelectStation}
          />
          <div className="search-stations-map">
            <MapView selectedStation={selectedStation} />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default SearchStations
