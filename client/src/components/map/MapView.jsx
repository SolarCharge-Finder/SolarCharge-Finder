import PropTypes from 'prop-types'

function MapView({ selectedStation }) {
  return (
    <div className="map-fallback" role="presentation">
      <div className="map-fallback__content">
        <p className="map-fallback__title">Interactive map coming soon</p>
        {selectedStation ? (
          <p className="map-fallback__subtitle">
            Selected station: <strong>{selectedStation.name}</strong>
          </p>
        ) : (
          <p className="map-fallback__subtitle">Select a station from the sidebar to preview its details.</p>
        )}
        <p className="map-fallback__hint">
          Another teammate will integrate Google Maps here. For now, this placeholder mimics the layout space.
        </p>
      </div>
    </div>
  )
}

MapView.propTypes = {
  selectedStation: PropTypes.shape({
    name: PropTypes.string,
  }),
}

MapView.defaultProps = {
  selectedStation: null,
}

export default MapView
