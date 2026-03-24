import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

// Leaflet marker fix - seems to work without this too, but path retrieval can be bricked by bunch react things.. so im keeping this as is (adeesha)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

//custom "your location" marker
const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapView = ({ stations = [], userLocation }) => {
  // Default center (Sri Lanka fallback)
  const defaultCenter = [7.8731, 80.7718];

  const center = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={redIcon}>
          <Popup>
            <strong>Your Current Location</strong>
          </Popup>
        </Marker>
      )}

      {/* Station Markers */}
      {stations.map(
        station =>
          station.location.coordinates[1] &&
          station.location.coordinates[0] && (
            <Marker
              key={station._id}
              position={[station.location.coordinates[1], station.location.coordinates[0]]}
            >
              <Popup>
                <div>
                  <strong>{station.name}</strong>
                  <br />
                  {station.address}
                  <br />
                  Status: {station.status}
                </div>
              </Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
};

MapView.propTypes = {
  stations: PropTypes.array.isRequired,
  userLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
};

export default MapView;
