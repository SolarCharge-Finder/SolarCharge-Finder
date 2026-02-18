import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MapSection from '../MapSection';
import * as stationService from '../../../services/stationService';

vi.mock('../../../services/stationService'); 

describe('MapSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders top rated stations', async () => {
    const mockStations = [
      { _id: '1', name: 'Station 1', rating: 5, address: 'Colombo', status: 'Open', distance: '2km' },
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
