import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from "react-router-dom";
import SearchPage from "../SearchPage";
import { searchStations, searchStationsByDistance } from "../../services/stationService";
import useGeolocation from "../../hooks/useGeoLocation";

// Mock API
vi.mock("../../services/stationService");

// Mock geolocation hook
vi.mock("../../hooks/useGeoLocation");

// Mock child components 
vi.mock("../../components/SearchBar/SearchBar", () => ({
  default: () => <div>SearchBar Component</div>,
}));

//loading location handling
vi.mock("../../components/SearchBar/SearchResults", () => ({
  default: ({ stations, loadingLocation }) => (
    <div>
      {loadingLocation && <p>Calculating...</p>}
      {stations?.map((s) => (
        <p key={s._id}>{s.name}</p>
      ))}
    </div>
  ),
}));

vi.mock("../../components/map/MapView", () => ({
  default: () => <div>MapView Component</div>,
}));

vi.mock("../../components/Navbar/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("../../components/Footer/Footer", () => ({
  default: () => <div>Footer</div>,
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter 
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {ui}
    </MemoryRouter>
  );
};

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence console.error for clean output in called error checks
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Default mock state
    useGeolocation.mockReturnValue({
      geolocation: { latitude: 6.9, longitude: 79.8 },
      error: null,
      loading: false,
      getLocation: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls searchStationsByDistance when geolocation is available", async () => {
    const mockData = [{ _id: "1", name: "Station X" }];
    vi.mocked(searchStationsByDistance).mockResolvedValue(mockData);

    renderWithRouter(<SearchPage />);
    
    await waitFor(() => {
      expect(searchStationsByDistance).toHaveBeenCalledWith(
        expect.objectContaining({ search: "" }),
        { latitude: 6.9, longitude: 79.8 }
      );
      expect(screen.getByText("Station X")).toBeInTheDocument();
    });
  });

  it("calls searchStations when geolocation is null", async () => {
    useGeolocation.mockReturnValue({
      geolocation: null,
      error: null,
      loading: false,
      getLocation: vi.fn(),
    });
    
    const mockData = [{ _id: "2", name: "Station Y" }];
    vi.mocked(searchStations).mockResolvedValue(mockData);

    renderWithRouter(<SearchPage />);
    
    await waitFor(() => {
      expect(searchStations).toHaveBeenCalled();
      expect(screen.getByText("Station Y")).toBeInTheDocument();
    });
  });

  it("shows loading state if geolocation is loading", () => {
    useGeolocation.mockReturnValue({
      geolocation: null,
      error: null,
      loading: true, 
      getLocation: vi.fn(),
    });

    renderWithRouter(<SearchPage />);
    expect(screen.getByText("Calculating...")).toBeInTheDocument();
  });

  it("renders stations when API returns data", async () => {
    useGeolocation.mockReturnValue({
      geolocation: null,
      error: null,
      loading: false,
      getLocation: vi.fn(),
    });

    vi.mocked(searchStations).mockResolvedValue([
      { _id: "1", name: "Station A" },
      { _id: "2", name: "Station B" },
    ]);

    renderWithRouter(<SearchPage />);
      
    expect(await screen.findByText("Station A")).toBeInTheDocument();
    expect(screen.getByText("Station B")).toBeInTheDocument();
  });

  it("displays error message when API fails", async () => {
    // Force the "else" branch in handleSearch by making geolocation null
    useGeolocation.mockReturnValue({
      geolocation: null,
      error: null,
      loading: false,
      getLocation: vi.fn(),
    });

    vi.mocked(searchStations).mockRejectedValue(new Error("API failure"));

    renderWithRouter(<SearchPage />);

    const errorElement = await screen.findByText("Error fetching stations");
    expect(errorElement).toBeInTheDocument();
  });

  it("calls getLocation on mount", () => {
    const mockGetLocation = vi.fn();
    useGeolocation.mockReturnValue({
      geolocation: null,
      error: null,
      loading: false,
      getLocation: mockGetLocation,
    });

    renderWithRouter(<SearchPage />);
    
    expect(mockGetLocation).toHaveBeenCalledTimes(1);
  });
});