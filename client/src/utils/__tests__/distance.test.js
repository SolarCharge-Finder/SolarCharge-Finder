import { describe, it, expect } from "vitest";
import { calculateDistance } from "../distance";

describe("calculateDistance", () => {

  it("returns 0 for identical points", () => {
    const point = [79.857, 6.915]; // [lng, lat]

    const result = calculateDistance(point, point);

    expect(result).toBeCloseTo(0, 5);
  });

  it("calculates correct distance between two known points", () => {
    // Colombo
    const colombo = [79.8612, 6.9271];

    // Kandy
    const kandy = [80.6337, 7.2906];

    const distance = calculateDistance(colombo, kandy);

    // Real distance ≈ 95–100 km (road ≠ straight line)
    expect(distance).toBeGreaterThan(80);
    expect(distance).toBeLessThan(120);
  });

  it("is symmetrical (A to B equals B to A)", () => {
    const pointA = [79.8612, 6.9271];
    const pointB = [80.6337, 7.2906];

    const distanceAB = calculateDistance(pointA, pointB);
    const distanceBA = calculateDistance(pointB, pointA);

    expect(distanceAB).toBeCloseTo(distanceBA, 5);
  });

  it("returns a number", () => {
    const result = calculateDistance(
      [79.8612, 6.9271],
      [80.6337, 7.2906]
    );

    expect(typeof result).toBe("number");
  });

  it("handles negative coordinates correctly", () => {
    // Example: London to New York
    const london = [-0.1276, 51.5074];
    const newYork = [-74.0060, 40.7128];

    const distance = calculateDistance(london, newYork);

    // Real straight-line distance ≈ 5570 km
    expect(distance).toBeGreaterThan(5000);
    expect(distance).toBeLessThan(6000);
  });

});