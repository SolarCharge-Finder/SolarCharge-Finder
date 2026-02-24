import { render, screen } from "@testing-library/react";
import { it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SearchResults from "../SearchResults";
import { calculateDistance } from "../../../utils/distance";

vi.mock("../../../utils/distance");

// Helper to render with router
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// no station resulsts test
it("shows no results message when stations array is empty", () => {
  renderWithRouter(<SearchResults stations={[]} error="" />);

  expect(
    screen.getByText("No stations found. Try adjusting your search criteria.")
  ).toBeInTheDocument();
});

// render station info test 
it("renders station information correctly", () => {
  const stations = [
    {
      _id: "1",
      name: "Colombo Fast Charge",
      address: "Colombo 03",
      status: "Available",
      rating: 4,
      distance: 5.2,
    },
  ];

  renderWithRouter(<SearchResults stations={stations} error="" />);

  expect(screen.getByText("Colombo Fast Charge")).toBeInTheDocument();
  expect(screen.getByText("Colombo 03")).toBeInTheDocument();
  expect(screen.getByText("Available")).toBeInTheDocument();
  expect(screen.getByText("5.2 km away")).toBeInTheDocument();
});

// distance calculation test - loading 
it('shows "Calculating..." when loadingLocation is true', () => {
  const stations = [
    {
      _id: "1",
      name: "Station A",
      address: "Address",
      status: "Available",
      rating: 3,
    },
  ];

  renderWithRouter(
    <SearchResults
      stations={stations}
      error=""
      loadingLocation={true}
    />
  );

  expect(screen.getByText("Calculating... away")).toBeInTheDocument();
});

// distance calculation test - calculation complete
it("calculates distance when userLocation is provided", () => {
  calculateDistance.mockReturnValue(7.456);

  const stations = [
    {
      _id: "1",
      name: "Station B",
      address: "Address",
      status: "Available",
      rating: 4,
      location: {
        coordinates: [79.857, 6.915],
      },
    },
  ];

  renderWithRouter(
    <SearchResults
      stations={stations}
      error=""
      userLocation={{ latitude: 6.9, longitude: 79.8 }}
    />
  );

  expect(calculateDistance).toHaveBeenCalled();
  expect(screen.getByText("7.5 km away")).toBeInTheDocument();
});

// distance calculation test - no location data/fallback
it('shows "N/A" when no location data is available', () => {
  const stations = [
    {
      _id: "1",
      name: "Station C",
      address: "Address",
      status: "Busy",
      rating: 2,
    },
  ];

  renderWithRouter(<SearchResults stations={stations} error="" />);

  expect(screen.getByText("N/A away")).toBeInTheDocument();
});

// reder stars logic test 
it("renders 5 star icons", () => {
  const stations = [
    {
      _id: "1",
      name: "Station D",
      address: "Address",
      status: "Available",
      rating: 4,
      distance: 2,
    },
  ];

  renderWithRouter(<SearchResults stations={stations} error="" />);

  const stars = screen.getAllByText("★");
  expect(stars).toHaveLength(5);
});