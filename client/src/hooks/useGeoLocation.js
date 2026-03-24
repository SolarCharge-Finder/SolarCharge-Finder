import { useState, useCallback } from 'react';

export default function useGeolocation() {
  // caching location to solve repeated location call wait issues
  const stored = sessionStorage.getItem('geolocation');
  const [geolocation, setGeolocation] = useState(stored ? JSON.parse(stored) : null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!stored); // only load if a cache isn't already available

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setGeolocation(coords);
        sessionStorage.setItem('geolocation', JSON.stringify(coords));
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      },
      {
        timeout: 5000, // fail after 5 sec
        maximumAge: 1000 * 60 * 5, // location cache
      }
    );
  }, []);

  const ready = !loading && geolocation !== null;

  return { geolocation, error, loading, ready, getLocation };
}
