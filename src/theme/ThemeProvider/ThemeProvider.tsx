import type { ReactNode } from 'react';
import type { FulfilledThemeConfiguration, Variant } from '@/theme/types/config';
import type { ComponentTheme } from '@/theme/types/theme';

import { createContext, useMemo } from 'react';
import { generateBackgrounds, staticBackgroundStyles } from '@/theme/backgrounds';
import { generateBorderColors, generateBorderRadius, generateBorderWidths, staticBorderStyles } from '@/theme/borders';
import componentsGenerator from '@/theme/components';
import { generateFontColors, generateFontSizes, staticFontStyles } from '@/theme/fonts';
import { generateGutters, staticGutterStyles } from '@/theme/gutters';
import layout from '@/theme/layout';
import generateConfig from '@/theme/ThemeProvider/generateConfig';
import { useSettings } from '@/state/SettingsProvider/SettingsProvider';

type Context = {
  components: ReturnType<typeof componentsGenerator>;
  navigationTheme: {
    colors: Record<string, string>;
    dark: boolean;
  };
} & ComponentTheme;

export const ThemeContext = createContext<Context | undefined>(undefined);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme: rawVariant } = useSettings();

  const variant: Variant = ['dark', 'default'].includes(rawVariant)
    ? (rawVariant as Variant)
    : 'default';

  const fullConfig = useMemo(() => generateConfig(variant), [variant]) satisfies FulfilledThemeConfiguration;

  const fonts = useMemo(() => {
    return {
      ...generateFontSizes(),
      ...generateFontColors(fullConfig),
      ...staticFontStyles,
    };
  }, [fullConfig]);

  const backgrounds = useMemo(() => {
    return {
      ...generateBackgrounds(fullConfig),
      ...staticBackgroundStyles,
    };
  }, [fullConfig]);

  const gutters = useMemo(() => {
    return {
      ...generateGutters(fullConfig),
      ...staticGutterStyles,
    };
  }, [fullConfig]);

  const borders = useMemo(() => {
    return {
      ...generateBorderColors(fullConfig),
      ...generateBorderRadius(),
      ...generateBorderWidths(),
      ...staticBorderStyles,
    };
  }, [fullConfig]);

  const navigationTheme = useMemo(() => {
    return {
      colors: fullConfig.navigationColors,
      dark: variant === 'dark',
    };
  }, [variant, fullConfig.navigationColors]);

  const theme = useMemo(() => {
    return {
      backgrounds,
      borders,
      colors: fullConfig.colors,
      fonts,
      gutters,
      layout,
      variant,
    } satisfies ComponentTheme;
  }, [variant, fonts, backgrounds, borders, fullConfig.colors, gutters]);

  const components = useMemo(() => componentsGenerator(theme), [theme]);

  const value = useMemo(() => {
    return { ...theme, components, navigationTheme } satisfies Context;
  }, [theme, components, navigationTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
