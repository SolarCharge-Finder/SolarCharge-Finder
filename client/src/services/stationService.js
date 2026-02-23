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
