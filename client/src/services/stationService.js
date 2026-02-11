import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/stations" || "http://localhost:5001/api/stations";

export const searchStations = async (SearchFilters) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: SearchFilters
    });

    return response.data;
};
