import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MapSection from '../MapSection';
import * as stationService from '../../../services/stationService';

vi.mock('../../../services/stationService'); 
vi.mock('../../../hooks/useGeoLocation', () => ({
  default: () => ({
    geolocation: { latitude: 6.9271, longitude: 79.8612 },
    error: null,
    loading: false,
    getLocation: vi.fn(),
  }),
}));

// Helper to render with router
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MapSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders top rated stations', async () => {
    const mockStations = [
      { _id: '1', name: 'Station 1', rating: 5, address: 'Colombo', status: 'Open', location: { coordinates: [79.8271, 6.9151] } },
    ];

    vi.mocked(stationService.getTopRatedStations).mockResolvedValue(mockStations);

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText('Station 1')).toBeInTheDocument();
      expect(screen.getByText('Colombo')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('handles no stations gracefully', async () => {
    vi.mocked(stationService.getTopRatedStations).mockResolvedValue([]);

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/No stations found/i)).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    vi.mocked(stationService.getTopRatedStations).mockRejectedValue(new Error('Network Error'));

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load stations/i)).toBeInTheDocument();
    });
  });
});
