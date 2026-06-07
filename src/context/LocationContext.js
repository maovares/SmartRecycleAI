import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(null);

  const refresh = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionGranted(false);
      return null;
    }
    setPermissionGranted(true);
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      setCoords({ latitude, longitude });

      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo[0]) {
        const parts = [geo[0].district || geo[0].city, geo[0].subregion || geo[0].region].filter(Boolean);
        setPlaceName(parts.join(', '));
      }

      return { latitude, longitude };
    } catch (_) {
      return coords;
    }
  }, [coords]);

  useEffect(() => { refresh(); }, []);

  return (
    <LocationContext.Provider value={{ coords, placeName, permissionGranted, refresh }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
