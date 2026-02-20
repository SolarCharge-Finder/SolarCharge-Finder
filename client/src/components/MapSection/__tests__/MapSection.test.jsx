import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MapSection from '../MapSection';
import * as stationService from '../../../services/stationService';

// Mock react-leaflet — jsdom lacks SVG APIs that Leaflet requires
vi.mock('react-leaflet', () => ({
  MapContainer: () => <div data-testid="map-container" />,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  Circle: () => null,
  useMap: () => ({ flyTo: vi.fn() }),
}));

vi.mock('../../../services/stationService');

// Provide a working navigator.geolocation so the component calls getNearbyStations
const mockGeolocationSuccess = () => {
  Object.defineProperty(window.navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn((success) => {
        success({ coords: { latitude: 7.9, longitude: 80.7 } });
      }),
    },
    writable: true,
    configurable: true,
  });
};

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MapSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeolocationSuccess();
  });

  it('renders stations', async () => {
    const mockStations = [
      { _id: '1', name: 'Station 1', rating: 5, address: 'Colombo', status: 'Open', distance: 2, location: { coordinates: [80.7, 7.9] } },
    ];

    stationService.getNearbyStations.mockResolvedValue(mockStations);

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText('Station 1')).toBeInTheDocument();
      expect(screen.getByText('Colombo')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('handles no stations gracefully', async () => {
    stationService.getNearbyStations.mockResolvedValue([]);

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/No stations found/i)).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    stationService.getNearbyStations.mockRejectedValue(new Error('Network Error'));

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load nearby stations/i)).toBeInTheDocument();
    });
  });
});
