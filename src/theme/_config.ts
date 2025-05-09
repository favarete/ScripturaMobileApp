import type { ThemeConfiguration } from '@/theme/types/config';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const enum Variant {
  DARK = 'dark',
}

const colorsLight = {
  full: '#FFFFFF',
  fullOpposite: '#000000',
  gray100: '#DFDFDF',
  gray200: '#A1A1A1',
  gray400: '#4D4D4D',
  gray50: '#EFEFEF',
  gray800: '#303030',
  green500: '#5BA65C',
  light: '#FAFAFA',
  purple100: '#E1E1EF',
  purple50: '#1B1A23',
  purple500: '#7e1dfb',
  red500: '#C13333',
  skeleton: '#A1A1A1',
} as const;

const colorsDark = {
  full: '#000000',
  fullOpposite: '#FFFFFF',
  gray100: '#131313',
  gray200: '#BABABA',
  gray400: '#969696',
  gray50: '#232323',
  gray800: '#E0E0E0',
  green500: '#5BA65C',
  light: '#FAFAFA',
  purple100: '#252732',
  purple50: '#101010',
  purple500: '#A6A4F0',
  red500: '#C13333',
  skeleton: '#303030',
} as const;

const sizes = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 80, 160] as const;

export const config = {
  backgrounds: colorsLight,
  borders: {
    colors: colorsLight,
    radius: [4, 16],
    widths: [1, 2],
  },
  colors: colorsLight,
  fonts: {
    colors: colorsLight,
    sizes,
  },
  gutters: sizes,
  navigationColors: {
    ...DefaultTheme.colors,
    background: colorsLight.full,
    card: colorsLight.gray50,
  },
  variants: {
    dark: {
      backgrounds: colorsDark,
      borders: {
        colors: colorsDark,
      },
      colors: colorsDark,
      fonts: {
        colors: colorsDark,
      },
      navigationColors: {
        ...DarkTheme.colors,
        background: colorsDark.purple50,
        card: colorsDark.purple50,
      },
    },
  },
} as const satisfies ThemeConfiguration;
