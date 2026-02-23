import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from "react-router-dom";
import SearchPage from "../SearchPage";
import { searchStations } from "../../services/stationService";
import useGeolocation from "../../hooks/useGeoLocation";

// Mock API
vi.mock("../../services/stationService");

// Mock geolocation hook
vi.mock("../../hooks/useGeoLocation");

// Mock child components 
vi.mock("../../components/SearchBar/SearchBar", () => ({
  default: () => <div>SearchBar Component</div>,
}));

vi.mock("../../components/SearchBar/SearchResults", () => ({
  default: ({ stations }) => (
    <div>
      {stations.map((s) => (
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

// Helper to wrap component with Router and Future Flags
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

// test search & filter api endpoint - parameter parsing, handleSearch function
describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    //silence console.error to reduce "search failed" logs
    vi.spyOn(console, 'error').mockImplementation(() => {});

    useGeolocation.mockReturnValue({
      geolocation: { latitude: 6.9, longitude: 79.8 },
      error: null,
      loading: false,
      getLocation: vi.fn(),
    });
  });
  it("calls searchStations on mount with URL params", async () => {
    searchStations.mockResolvedValue([]);

    renderWithRouter(<SearchPage />, { route: "/search?city=Colombo" });

    await waitFor(() => {
      expect(searchStations).toHaveBeenCalledWith({
        search: "",
        city: "Colombo",
        status: "",
        connectorType: "",
      });
    });
  });

  // test to see station render - passing data to search resulsts
  it("renders stations when API returns data", async () => {
    searchStations.mockResolvedValue([
      { _id: "1", name: "Station A" },
      { _id: "2", name: "Station B" },
    ]);

    renderWithRouter(<SearchPage />);
    
    expect(await screen.findByText("Station A")).toBeInTheDocument();
    expect(screen.getByText("Station B")).toBeInTheDocument();
  });

  //error handling test - error state, error message display
  it("displays error message when API fails", async () => {
    searchStations.mockRejectedValue(new Error("API failure"));

    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText("Error fetching stations")).toBeInTheDocument();
    });
  });

  // tests if getLocation is called on mount ]
  it("calls getLocation on mount", () => {
    const mockGetLocation = vi.fn();

    useGeolocation.mockReturnValue({
      geolocation: null,
      error: null,
      loading: false,
      getLocation: mockGetLocation,
    });

    renderWithRouter(<SearchPage />);

    expect(mockGetLocation).toHaveBeenCalled();
  });
});