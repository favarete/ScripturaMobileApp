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

import { SupportedLanguages } from '@/hooks/language/schema';

import { DEVICE_ONLY_STORAGE } from '@/state/constants';

type SettingsContextType = {
  changeLanguage: (lang: SupportedLanguages) => void;
  changeTheme: (variant: string) => void;
  language: SupportedLanguages;
  theme: string;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceOnlyStorage = useMMKV({ id: DEVICE_ONLY_STORAGE });

  // State for theme and language
  const [theme, setTheme] = useState(
    (deviceOnlyStorage.getString('theme') as Variant) || 'default',
  );
  const [language, setLanguage] = useState<SupportedLanguages>(
    (deviceOnlyStorage.getString('language') as SupportedLanguages) ||
      SupportedLanguages.EN_EN,
  );

  // Initialize theme and language on mount
  useEffect(() => {
    const appHasThemeDefined = deviceOnlyStorage.contains('theme');
    if (!appHasThemeDefined) {
      deviceOnlyStorage.set('theme', 'default');
      setTheme('default');
    }

    const appHasLanguageDefined = deviceOnlyStorage.contains('language');
    if (!appHasLanguageDefined) {
      deviceOnlyStorage.set('language', SupportedLanguages.EN_EN);
      setLanguage(SupportedLanguages.EN_EN);
      void i18next.changeLanguage(SupportedLanguages.EN_EN);
    } else {
      const storedLanguage = deviceOnlyStorage.getString(
        'language',
      ) as SupportedLanguages;
      setLanguage(storedLanguage);
      void i18next.changeLanguage(storedLanguage);
    }
  }, [deviceOnlyStorage]);

  const changeTheme = useCallback(
    (variant: string) => {
      setTheme(variant as Variant);
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
    () => ({ changeLanguage, changeTheme, language, theme }),
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
