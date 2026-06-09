import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Forces all consumers to re-read user.displayName / photoURL after updateProfile
  const refreshUser = useCallback(() => setTick(t => t + 1), []);

  return (
    <AuthContext.Provider value={{ user, loading, ecoPoints, setEcoPoints, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}