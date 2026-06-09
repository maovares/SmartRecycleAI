import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ecoPoints, setEcoPoints] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Re-reads currentUser from Firebase Auth and puts the fresh object into state,
  // so consumers (e.g. HomeScreen) pick up updated displayName / photoURL immediately.
  const refreshUser = useCallback(() => {
    const fresh = getAuth().currentUser;
    if (fresh) setUser(fresh);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, ecoPoints, setEcoPoints, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}