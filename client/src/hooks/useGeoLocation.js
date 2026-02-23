import { useState, useCallback } from "react";

export default function useGeolocation() {
    const [geolocation, setGeolocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
        (position) => {
            setGeolocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            });
            setLoading(false);
        },
        (err) => {
            setError(err.message);
            setLoading(false);
        }
        );
    }, []);

    return { geolocation, error, loading, getLocation };
}