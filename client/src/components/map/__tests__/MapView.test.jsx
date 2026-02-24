import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MapView from "../MapView";

// Mock react-leaflet
vi.mock("react-leaflet", async () => {
  // fixing hoisting issue with proptype import 
  const { default: PropTypes } = await import('prop-types');

  return {
    MapContainer: Object.assign(
      ({ children, center }) => (
        <div data-testid="map" data-center={JSON.stringify(center)}>
          {children}
        </div>
      ),
      { propTypes: { children: PropTypes.node, center: PropTypes.oneOfType([PropTypes.array, PropTypes.object]) } }
    ),

    TileLayer: () => <div data-testid="tile-layer" />,

    Marker: Object.assign(
      ({ children, position }) => (
        <div data-testid="marker" data-position={JSON.stringify(position)}>
          {children}
        </div>
      ),
      { propTypes: { children: PropTypes.node, position: PropTypes.oneOfType([PropTypes.array, PropTypes.object]) } }
    ),

    Popup: Object.assign(
      ({ children }) => <div>{children}</div>,
      { propTypes: { children: PropTypes.node } }
    ),
  };
});

describe("MapView", () => {
  it("uses default center when no userLocation provided", () => {
    render(<MapView stations={[]} />);

    const map = screen.getByTestId("map");
    expect(map).toBeInTheDocument();

    expect(map.dataset.center).toBe(JSON.stringify([7.8731, 80.7718]));
  });

  it("uses userLocation as center when provided", () => {
    const userLocation = { latitude: 6.9, longitude: 79.8 };

    render(<MapView stations={[]} userLocation={userLocation} />);

    const map = screen.getByTestId("map");
    expect(map.dataset.center).toBe(JSON.stringify([6.9, 79.8]));
  });

  it("renders user marker when userLocation exists", () => {
    const userLocation = { latitude: 6.9, longitude: 79.8 };

    render(<MapView stations={[]} userLocation={userLocation} />);

    const markers = screen.getAllByTestId("marker");

    expect(markers.length).toBe(1);
    expect(markers[0].dataset.position).toBe(JSON.stringify([6.9, 79.8]));
  });

  it("renders markers for valid stations", () => {
    const stations = [
      {
        _id: "1",
        name: "Station A",
        address: "Colombo",
        status: "Open",
        location: {
          coordinates: [79.8612, 6.9271], // [lng, lat]
        },
      },
      {
        _id: "2",
        name: "Station B",
        address: "Kandy",
        status: "Closed",
        location: {
          coordinates: [80.6337, 7.2906],
        },
      },
    ];

    render(<MapView stations={stations} />);

    const markers = screen.getAllByTestId("marker");

    // 2 stations, no user location
    expect(markers.length).toBe(2);
  });

  it("does not render station if coordinates are invalid", () => {
    const stations = [
      {
        _id: "1",
        name: "Invalid Station",
        address: "Nowhere",
        status: "Open",
        location: {
          coordinates: [null, null],
        },
      },
    ];

    render(<MapView stations={stations} />);

    const markers = screen.queryAllByTestId("marker");

    expect(markers.length).toBe(0);
  });
});