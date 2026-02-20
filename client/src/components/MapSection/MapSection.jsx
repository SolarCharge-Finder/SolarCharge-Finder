import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SearchResults from '../SearchBar/SearchResults';
import { getNearbyStations } from '../../services/stationService';

// Fix Leaflet default marker icon broken by Vite asset hashing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Blue pulsing icon for user's own location
const userIcon = L.divIcon({
  className: '',
  html: '<div class="user-location-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const POLL_INTERVAL_MS = 30_000;
const RADIUS_OPTIONS = [10, 25, 50, 100]; // km

// Fly/pan to a position inside the map
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const coords = target.location?.coordinates;
    if (coords?.length === 2) map.flyTo([coords[1], coords[0]], 14, { duration: 1.2 });
  }, [target, map]);
  return null;
}

// Recenter map to user location when it becomes known
function RecenterUser({ userPos }) {
  const map = useMap();
  const centred = useRef(false);
  useEffect(() => {
    if (userPos && !centred.current) {
      map.flyTo([userPos.lat, userPos.lng], 12, { duration: 1.5 });
      centred.current = true;
    }
  }, [userPos, map]);
  return null;
}

function MapSection() {
  const [stations, setStations] = useState([]);
  const [sortOption, setSortOption] = useState('distance');
  const [radius, setRadius] = useState(50);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userPos, setUserPos] = useState(null);           // { lat, lng }
  const [gpsStatus, setGpsStatus] = useState('pending'); // pending | granted | denied | unsupported
  const markerRefs = useRef({});
  const pollRef = useRef(null);

  // Haversine distance in km between two lat/lng points
  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchNearby = useCallback(async (lat, lng, r, silent = false) => {
    try {
      const data = await getNearbyStations(lat, lng, r);
      // Attach live distance to each station
      const withDist = data.map((s) => {
        const coords = s.location?.coordinates;
        const dist = coords?.length === 2
          ? haversine(lat, lng, coords[1], coords[0])
          : null;
        return { ...s, distance: dist !== null ? parseFloat(dist.toFixed(1)) : null };
      });
      setStations(withDist);
      setLastUpdated(new Date());
      if (!silent) setError(null);
    } catch (err) {
      console.error('Error fetching nearby stations:', err);
      if (!silent) setError(err);
    }
  }, []);

  // Request GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setGpsStatus('granted');
        fetchNearby(lat, lng, radius);
      },
      () => {
        setGpsStatus('denied');
        setError(new Error('Location access denied. Enable GPS to see nearby stations.'));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when radius changes (only if we have GPS)
  useEffect(() => {
    if (userPos) fetchNearby(userPos.lat, userPos.lng, radius);
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-poll every 30 s
  useEffect(() => {
    if (!userPos) return;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(
      () => fetchNearby(userPos.lat, userPos.lng, radius, true),
      POLL_INTERVAL_MS,
    );
    return () => clearInterval(pollRef.current);
  }, [userPos, radius, fetchNearby]);

  // Re-fetch on tab focus
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && userPos) {
        fetchNearby(userPos.lat, userPos.lng, radius, true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userPos, radius, fetchNearby]);

  // Open popup when card selected
  useEffect(() => {
    if (selectedStation) {
      const id = selectedStation._id ?? selectedStation.id;
      markerRefs.current[id]?.openPopup();
    }
  }, [selectedStation]);

  // Sort stations for the list
  const sortedStations = [...stations].sort((a, b) => {
    if (sortOption === 'distance') return (a.distance ?? 9999) - (b.distance ?? 9999);
    if (sortOption === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortOption === 'name') return (a.name ?? '').localeCompare(b.name ?? '');
    return 0;
  });

  const defaultCenter = [7.8731, 80.7718];
  const defaultZoom = 8;
  const stationsWithCoords = stations.filter((s) => s.location?.coordinates?.length === 2);

  return (
    <section className="map-section" id="map">
      <div className="map-container">
        <div className="section-header">
          <span className="section-tag">📍 Nearby Stations</span>
          <h2 className="section-title">Explore Solar Charging Stations</h2>
          <p className="section-desc">
            Showing stations within <strong>{radius} km</strong> of your location.
          </p>
        </div>

        <div className="map-content">
          {/* ── Live OpenStreetMap ── */}
          <div className="map-view">
            <div className="map-live-bar">
              <span className={`map-live-dot ${gpsStatus !== 'granted' ? 'map-live-dot--off' : ''}`} />
              <span className="map-live-label">
                {gpsStatus === 'pending' && '📡 Detecting your location…'}
                {gpsStatus === 'granted' && (
                  <>
                    Live · auto-updates every 30 s
                    {lastUpdated && (
                      <span className="map-live-time">
                        &nbsp;· last updated {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </>
                )}
                {gpsStatus === 'denied' && '⚠️ GPS denied — enable location access and refresh'}
                {gpsStatus === 'unsupported' && '⚠️ Geolocation not supported by this browser'}
              </span>

              {/* Radius selector */}
              <select
                className="map-radius-select"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                title="Search radius"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>

              <button
                type="button"
                className="map-refresh-btn"
                onClick={() => userPos && fetchNearby(userPos.lat, userPos.lng, radius)}
                disabled={!userPos}
                title="Refresh now"
              >
                ↻ Refresh
              </button>
            </div>

            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ width: '100%', height: '500px' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location dot + radius ring */}
              {userPos && (
                <>
                  <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                    <Popup>📍 Your location</Popup>
                  </Marker>
                  <Circle
                    center={[userPos.lat, userPos.lng]}
                    radius={radius * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.06, weight: 2 }}
                  />
                </>
              )}

              {/* Station markers */}
              {stationsWithCoords.map((station) => {
                const [lng, lat] = station.location.coordinates;
                const isOpen = station.status === 'Open';
                const id = station._id ?? station.id;
                return (
                  <Marker
                    key={id}
                    position={[lat, lng]}
                    icon={isOpen ? greenIcon : redIcon}
                    ref={(ref) => { if (ref) markerRefs.current[id] = ref; }}
                  >
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <strong style={{ fontSize: '0.95rem' }}>{station.name}</strong>
                        {station.address && (
                          <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.8rem' }}>
                            📍 {station.address}
                          </p>
                        )}
                        <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>
                          Status:{' '}
                          <span style={{ color: isOpen ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                            {station.status}
                          </span>
                        </p>
                        {station.distance != null && (
                          <p style={{ margin: '4px 0', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                            🛣 {station.distance} km away
                          </p>
                        )}
                        {station.rating > 0 && (
                          <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>⭐ {station.rating?.toFixed(1)}</p>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block', marginTop: 6, padding: '4px 10px',
                            background: '#10b981', color: '#fff', borderRadius: 999,
                            fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600,
                          }}
                        >
                          🗺 Get Directions
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <FlyTo target={selectedStation} />
              <RecenterUser userPos={userPos} />
            </MapContainer>
          </div>

          {/* ── Station List ── */}
          <div className="station-list">
            <div className="list-header">
              <h3>
                {gpsStatus === 'pending'
                  ? 'Locating you…'
                  : `${stations.length} station${stations.length !== 1 ? 's' : ''} within ${radius} km`}
              </h3>
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <div className="cards-scroll">
              {gpsStatus === 'denied' || gpsStatus === 'unsupported' ? (
                <p className="no-results">
                  {gpsStatus === 'denied'
                    ? '📵 Location access denied. Please enable GPS in your browser and refresh.'
                    : '📵 Your browser does not support geolocation.'}
                </p>
              ) : gpsStatus === 'pending' ? (
                <p className="no-results">📡 Waiting for GPS signal…</p>
              ) : error ? (
                <p className="no-results">Failed to load nearby stations.</p>
              ) : sortedStations.length === 0 ? (
                <p className="no-results">No stations found within {radius} km. Try increasing the radius.</p>
              ) : (
                <SearchResults
                  stations={sortedStations}
                  error={null}
                  onSelect={(station) => setSelectedStation(station)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapSection;

