import type { FC, ReactNode } from 'react';
import type { SupportedLanguages } from '@/hooks/language/schema';
import type { Variant } from '@/theme/types/config';

import i18next from 'i18next';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useMMKV } from 'react-native-mmkv';

import {
  DEFAULT_HOME_FOLDER,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEVICE_ONLY_STORAGE,
} from '@/state/defaults';

type SettingsContextType = {
  changeLanguage: (lang: SupportedLanguages) => void;
  changeTheme: (variant: Variant) => void;
  language: SupportedLanguages;
  theme: Variant;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const deviceOnlyStorage = useMMKV({ id: DEVICE_ONLY_STORAGE });

  // Get Initial Values
  const [theme, setTheme] = useState<Variant>(
    (deviceOnlyStorage.getString('theme') as Variant) || DEFAULT_THEME,
  );
  const [language, setLanguage] = useState<SupportedLanguages>(
    (deviceOnlyStorage.getString('language') as SupportedLanguages) ||
      DEFAULT_LANGUAGE,
  );
  void i18next.changeLanguage(language);

  // Initialize Values on mount
  useEffect(() => {
    const appHasThemeDefined = deviceOnlyStorage.contains('theme');
    if (!appHasThemeDefined) {
      deviceOnlyStorage.set('theme', DEFAULT_THEME);
    }

    const appHasLanguageDefined = deviceOnlyStorage.contains('language');
    if (!appHasLanguageDefined) {
      deviceOnlyStorage.set('language', DEFAULT_LANGUAGE);
    }

    const appHasHomeFolderDefined = deviceOnlyStorage.contains('home');
    if (!appHasHomeFolderDefined) {
      deviceOnlyStorage.set('home', DEFAULT_HOME_FOLDER);
    }
  }, [deviceOnlyStorage]);

  const changeTheme = useCallback(
    (variant: Variant) => {
      setTheme(variant);
      deviceOnlyStorage.set('theme', variant);
    },
    [deviceOnlyStorage],
  );

  const changeLanguage = useCallback(
    (lang: SupportedLanguages) => {
      setLanguage(lang);
      void i18next.changeLanguage(lang);
      deviceOnlyStorage.set('language', lang);
    },
    [deviceOnlyStorage],
  );

  const value = useMemo(
    () => ({
      changeLanguage,
      changeTheme,
      language,
      theme,
    }),
    [theme, language, changeTheme, changeLanguage],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
