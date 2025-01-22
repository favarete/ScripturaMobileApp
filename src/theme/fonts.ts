import type { TextStyle } from 'react-native';
import type { UnionConfiguration } from '@/theme/types/config';
import type { FontColors, FontSizes } from '@/theme/types/fonts';

import { config } from '@/theme/_config';

export const generateFontColors = (configuration: UnionConfiguration) => {
  return Object.entries(configuration.fonts.colors ?? {}).reduce(
    (acc, [key, value]) => {
      return Object.assign(acc, {
        [`${key}`]: {
          color: value,
        },
      });
    },
    {} as FontColors,
  );
};

export const generateFontSizes = () => {
  return config.fonts.sizes.reduce((acc, size) => {
    return Object.assign(acc, {
      [`size_${size}`]: {
        fontSize: size,
      },
    });
  }, {} as FontSizes);
};

export const staticFontStyles = {
  alignCenter: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  defaultCondensedBold: {
    fontFamily: 'OpenSans_Condensed-Bold',
  },
  defaultCondensedBoldItalic: {
    fontFamily: 'OpenSans_Condensed-BoldItalic',
  },
  defaultCondensedExtraBold: {
    fontFamily: 'OpenSans_Condensed-ExtraBold',
  },
  defaultCondensedExtraBoldItalic: {
    fontFamily: 'OpenSans_Condensed-ExtraBoldItalic',
  },
  defaultCondensedItalic: {
    fontFamily: 'OpenSans_Condensed-Italic',
  },
  defaultCondensedLight: {
    fontFamily: 'OpenSans_Condensed-Light',
  },
  defaultCondensedLightItalic: {
    fontFamily: 'OpenSans_Condensed-LightItalic',
  },
  defaultCondensedMedium: {
    fontFamily: 'OpenSans_Condensed-Medium',
  },
  defaultCondensedMediumItalic: {
    fontFamily: 'OpenSans_Condensed-MediumItalic',
  },
  defaultCondensedRegular: {
    fontFamily: 'OpenSans_Condensed-Regular',
  },
  defaultCondensedSemiBold: {
    fontFamily: 'OpenSans_Condensed-SemiBold',
  },
  defaultCondensedSemiBoldItalic: {
    fontFamily: 'OpenSans_Condensed-SemiBoldItalic',
  },
  defaultFontFamilyBold: {
    fontFamily: 'OpenSans-Bold',
  },
  defaultFontFamilyBoldItalic: {
    fontFamily: 'OpenSans-BoldItalic',
  },
  defaultFontFamilyExtraBold: {
    fontFamily: 'OpenSans-ExtraBold',
  },
  defaultFontFamilyExtraBoldItalic: {
    fontFamily: 'OpenSans-ExtraBoldItalic',
  },
  defaultFontFamilyItalic: {
    fontFamily: 'OpenSans-Italic',
  },
  defaultFontFamilyLight: {
    fontFamily: 'OpenSans-Light',
  },
  defaultFontFamilyLightItalic: {
    fontFamily: 'OpenSans-LightItalic',
  },
  defaultFontFamilyMedium: {
    fontFamily: 'OpenSans-Medium',
  },
  defaultFontFamilyMediumItalic: {
    fontFamily: 'OpenSans-MediumItalic',
  },
  defaultFontFamilyRegular: {
    fontFamily: 'OpenSans-Regular',
  },
  defaultFontFamilySemibold: {
    fontFamily: 'OpenSans-SemiBold',
  },
  defaultFontFamilySemiBoldItalic: {
    fontFamily: 'OpenSans-SemiBoldItalic',
  },
  defaultSemiCondensedBold: {
    fontFamily: 'OpenSans_SemiCondensed-Bold',
  },
  defaultSemiCondensedBoldItalic: {
    fontFamily: 'OpenSans_SemiCondensed-BoldItalic',
  },
  defaultSemiCondensedExtraBold: {
    fontFamily: 'OpenSans_SemiCondensed-ExtraBold',
  },
  defaultSemiCondensedExtraBoldItalic: {
    fontFamily: 'OpenSans_SemiCondensed-ExtraBoldItalic',
  },
  defaultSemiCondensedItalic: {
    fontFamily: 'OpenSans_SemiCondensed-Italic',
  },
  defaultSemiCondensedLight: {
    fontFamily: 'OpenSans_SemiCondensed-Light',
  },
  defaultSemiCondensedLightItalic: {
    fontFamily: 'OpenSans_SemiCondensed-LightItalic',
  },
  defaultSemiCondensedMedium: {
    fontFamily: 'OpenSans_SemiCondensed-Medium',
  },
  defaultSemiCondensedMediumItalic: {
    fontFamily: 'OpenSans_SemiCondensed-MediumItalic',
  },
  defaultSemiCondensedRegular: {
    fontFamily: 'OpenSans_SemiCondensed-Regular',
  },
  defaultSemiCondensedSemiBold: {
    fontFamily: 'OpenSans_SemiCondensed-SemiBold',
  },
  defaultSemiCondensedSemiBoldItalic: {
    fontFamily: 'OpenSans_SemiCondensed-SemiBoldItalic',
  },
  lineGap: {
    lineHeight: 24,
  },
  uppercase: {
    textTransform: 'uppercase',
  },

} as const satisfies Record<string, TextStyle>;
