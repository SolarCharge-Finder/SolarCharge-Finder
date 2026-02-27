import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getTopRatedStations, searchStations } from '../stationService';

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api") + "/stations";


vi.mock('axios');

describe('stationService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); 
  });

  it('searchStations calls axios with correct params', async () => {
    const mockData = [{ name: 'Station 1', rating: 4 }];
    axios.get.mockResolvedValue({ data: mockData });

    const filters = { district: 'Colombo', status: '', connectorType: '' };
    const result = await searchStations(filters);

    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/search`, { params: filters });
    expect(result).toEqual(mockData);
  });

  it('getTopRatedStations returns top rated stations', async () => {
    const mockData = [{ name: 'Top Station', rating: 5 }];
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getTopRatedStations();

    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/top-rated`);
    expect(result).toEqual(mockData);
  });

  it('handles axios errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));

    await expect(getTopRatedStations()).rejects.toThrow('Network Error');
    await expect(searchStations({})).rejects.toThrow('Network Error');
  });
});
