import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MapSection from '../MapSection';
import * as stationService from '../../../services/stationService';

// Mock the service
vi.mock('../../../services/stationService');

// Mock the hook
const mockGetLocation = vi.fn();
vi.mock('../../../hooks/useGeoLocation', () => ({
  default: () => ({
    geolocation: { latitude: 6.9271, longitude: 79.8612 },
    error: null,
    loading: false,
    getLocation: mockGetLocation,
  }),
}));

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MapSection Component', () => {
  const mockStations = [
    { _id: '1', name: 'Station 1', rating: 5, address: 'Colombo', status: 'Open', location: { coordinates: [79.8271, 6.9151] } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Silence console errors during failure tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders stations sorted by distance by default', async () => {
    vi.mocked(stationService.nearbyStations).mockResolvedValue(mockStations);
    
    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText('Station 1')).toBeInTheDocument();
    });
    expect(stationService.nearbyStations).toHaveBeenCalled();
  });

  it('switches to top rated stations when dropdown changes', async () => {
    vi.mocked(stationService.nearbyStations).mockResolvedValue(mockStations);
    vi.mocked(stationService.getTopRatedStations).mockResolvedValue([{ ...mockStations[0], name: 'Top Station' }]);

    renderWithRouter(<MapSection />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'rating' } });

    await waitFor(() => {
      expect(screen.getByText('Top Station')).toBeInTheDocument();
    });
  });

  it('handles empty station lists', async () => {
    // Default sort is distance, so mock nearbyStations
    vi.mocked(stationService.nearbyStations).mockResolvedValue([]);

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/No stations found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    vi.mocked(stationService.nearbyStations).mockRejectedValue(new Error('API Down'));

    renderWithRouter(<MapSection />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load stations/i)).toBeInTheDocument();
    });
  });
});