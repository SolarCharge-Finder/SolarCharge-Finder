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

export const getNearbyStations = async (lat, lng, radiusKm = 50) => {
    const response = await axios.get(`${API_URL}/nearby`, {
        params: { lat, lng, radius: radiusKm },
    });
    return response.data;
}

export const getStationById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    // controller returns { data: station }
    return response.data.data ?? response.data;
}

export const getStationReviews = async (stationId) => {
    const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');
    const response = await axios.get(`${BASE}/reviews/${stationId}`);
    return response.data.data ?? response.data;
}

export const submitReview = async (payload, token) => {
    const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');
    const response = await axios.post(`${BASE}/reviews`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export const deleteReview = async (reviewId, token) => {
    const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');
    const response = await axios.delete(`${BASE}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}
