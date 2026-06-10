import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import es from './es';
import en from './en';

const translations = { es, en };
const STORAGE_KEY = '@language';

function deviceLang() {
  const code = getLocales()[0]?.languageCode ?? 'es';
  return code.startsWith('es') ? 'es' : 'en';
}

function lookup(obj, key) {
  return key.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(deviceLang);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'es' || v === 'en') setLangState(v);
    });
  }, []);

  const setLang = useCallback(async (l) => {
    setLangState(l);
    await AsyncStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key, params) => {
      const str =
        lookup(translations[lang], key) ??
        lookup(translations.es, key) ??
        key;
      if (!params) return str;
      return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? ''));
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
