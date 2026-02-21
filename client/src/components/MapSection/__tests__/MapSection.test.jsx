import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('MapSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders top rated stations', async () => {
    const mockStations = [
      { _id: '1', name: 'Station 1', rating: 5, address: 'Colombo', status: 'Open', location: { coordinates: [79.8271, 6.9151] } },
    ];

    stationService.getTopRatedStations.mockResolvedValue(mockStations);

    render(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText('Station 1')).toBeInTheDocument();
      expect(screen.getByText('Colombo')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('handles no stations gracefully', async () => {
    stationService.getTopRatedStations.mockResolvedValue([]);

    render(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/No stations found/i)).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    stationService.getTopRatedStations.mockRejectedValue(new Error('Network Error'));

    render(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load stations/i)).toBeInTheDocument();
    });
  });
});
