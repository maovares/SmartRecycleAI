import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme';

const ThemeContext = createContext(null);

const STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState('system'); // 'light' | 'dark' | 'system'

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setPreference(v);
    });
  }, []);

  const isDark =
    preference === 'system' ? systemScheme === 'dark' : preference === 'dark';

  const setTheme = async (p) => {
    setPreference(p);
    await AsyncStorage.setItem(STORAGE_KEY, p);
  };

  const value = useMemo(
    () => ({ preference, setTheme, isDark, colors: isDark ? darkColors : lightColors }),
    [preference, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;
