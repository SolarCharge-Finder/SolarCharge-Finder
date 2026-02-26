import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api") + "/stations";

export const searchStations = async (SearchFilters) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: SearchFilters
    });

    return response.data;
};

export const getTopRatedStations = async () => {
    const response = await axios.get(`${API_URL}/top-rated`);
    return response.data;
}

export const searchStationsByDistance = async (filters = {}, userLocation) => {
    if (!userLocation) throw new Error("Location required for distance filter");

    const params = new URLSearchParams(filters);
    params.append("lat", userLocation.latitude);
    params.append("lng", userLocation.longitude);

    //const res = await fetch(`/api/stations/distance-search?${params.toString()}`);
    const response = await axios.get(`${API_URL}/distance-search`, {
        params
    });

    return response.data;
};

export const nearbyStations = async (userLocation, maxDistance, responseLimit) => {
    if (!userLocation) throw new Error("Location required for distance filter");
    //can force maxDistance & limit requirement here... 
    //for now they were just if present in params 

    const params = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        ...(maxDistance && { maxDistance }), 
        ...(responseLimit && { responseLimit })
    };

    const response = await axios.get(`${API_URL}/nearby-stations`, {
        params
    });

    return response.data;
}