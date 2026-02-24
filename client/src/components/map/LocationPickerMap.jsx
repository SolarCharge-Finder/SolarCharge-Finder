import { useEffect } from "react"
import PropTypes from "prop-types"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const SRI_LANKA_CENTER = [7.8731, 80.7718]
const SRI_LANKA_BOUNDS = [
  [5.916, 79.652],
  [9.835, 81.879],
]

function ClickMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onChange([lat, lng])
    },
  })

  return position ? <Marker position={position} /> : null
}

function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 13)
    }
  }, [center, map])
  
  // Also recenter on initial mount if center exists
  useEffect(() => {
    if (center) {
      setTimeout(() => map.invalidateSize(), 100)
      map.setView(center, 13)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return null
}

export default function LocationPickerMap({ value, onChange }) {
  // Use a key to force re-mount when editing a different location
  const mapKey = value ? `${value[0]}-${value[1]}` : 'default'
  
  return (
    <div style={{ height: 300, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        key={mapKey}
        center={value || SRI_LANKA_CENTER}
        zoom={value ? 13 : 8}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickMarker position={value} onChange={onChange} />
        {value && <Recenter center={value} />}
      </MapContainer>
    </div>
  )
}

LocationPickerMap.propTypes = {
  value: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
}