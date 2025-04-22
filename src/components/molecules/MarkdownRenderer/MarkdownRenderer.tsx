import Markdown from '@ronradtke/react-native-markdown-display';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

type MarkdownRendererProps = {
  markdown: string;
};

function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const markdownStyles = StyleSheet.create({
    // The main container
    body: {
      ...fonts.size_16,
      ...fonts.gray800,
      lineHeight: 24,
      ...fonts.defaultFontFamilyRegular,
      ...gutters.marginBottom_12,
    },

    // Headings
    heading1: {
      lineHeight: 40,
      ...layout.row,
      ...fonts.defaultFontFamilyExtraBold,
      ...fonts.size_32,
      ...gutters.paddingVertical_8,
      borderBottomColor: colors.fullOpposite + '1F',
      borderBottomWidth: 1,
    },
    heading2: {
      lineHeight: 36,
      ...layout.row,
      ...fonts.defaultFontFamilyExtraBold,
      ...fonts.size_28,
      ...gutters.paddingVertical_8,
      borderBottomColor: colors.fullOpposite + '1F',
      borderBottomWidth: 1,
    },
    heading3: {
      lineHeight: 32,
      ...layout.row,
      ...fonts.defaultFontFamilyExtraBold,
      ...fonts.size_24,
      ...gutters.paddingVertical_8,
      borderBottomColor: colors.fullOpposite + '1F',
      borderBottomWidth: 1,
    },
    heading4: {
      lineHeight: 28,
      ...layout.row,
      ...fonts.defaultFontFamilyExtraBold,
      ...fonts.size_20,
      ...gutters.paddingVertical_8,
      borderBottomColor: colors.fullOpposite + '1F',
      borderBottomWidth: 1,
    },
    heading5: {
      lineHeight: 24,
      ...layout.row,
      ...fonts.defaultFontFamilyExtraBold,
      ...fonts.size_16,
      ...gutters.paddingVertical_8,
      borderBottomColor: colors.fullOpposite + '1F',
      borderBottomWidth: 1,
    },
    heading6: {
      lineHeight: 24,
      ...layout.row,
      ...fonts.defaultFontFamilyBold,
      ...fonts.size_16,
      ...gutters.paddingVertical_8,
      borderBottomColor: colors.fullOpposite + '1F',
      borderBottomWidth: 1,
    },

    // Horizontal Rule
    hr: {
      ...gutters.marginHorizontal_80,
      ...gutters.marginVertical_12,
      borderBottomColor: colors.fullOpposite,
      borderBottomWidth: 1,
      opacity: 0.1,
    },

    // Emphasis
    em: {
      ...fonts.defaultFontFamilyItalic,
    },
    s: {
      textDecorationLine: 'line-through',
      ...fonts.defaultFontFamilyRegular,
    },
    strong: {
      ...fonts.defaultFontFamilyBold,
    },

    // Blockquotes
    blockquote: {
      ...fonts.defaultSemiCondensedItalic,
      backgroundColor: colors.gray50,
      borderColor: colors.purple500,
      borderLeftWidth: 4,
      color: colors.gray800,
      letterSpacing: 1,
      ...gutters.marginLeft_4,
      ...gutters.paddingHorizontal_8,
    },

    // Lists
    bullet_list: {},
    list_item: {
      ...layout.row,
      ...layout.justifyStart,
    },
    ordered_list: {},
    // @pseudo class, does not have a unique render rule
    bullet_list_icon: {
      ...gutters.marginHorizontal_8,
      ...fonts.defaultFontFamilyExtraBold,
    },
    // @pseudo class, does not have a unique render rule
    bullet_list_content: {
      ...layout.flex_1,
      ...fonts.size_16,
      ...layout.justifyCenter,
    },
    // @pseudo class, does not have a unique render rule
    ordered_list_icon: {
      ...gutters.marginHorizontal_8,
      ...fonts.defaultSemiCondensedBold,
    },
    // @pseudo class, does not have a unique render rule
    ordered_list_content: {
      ...layout.flex_1,
    },

    // Code
    code_block: {
      backgroundColor: colors.fullOpposite + '1A',
      borderColor: colors.fullOpposite + '4E',
      borderRadius: 4,
      borderWidth: 1,
      ...gutters.padding_12,
      ...Platform.select({
        ['android']: {
          fontFamily: 'monospace',
        },
        ['ios']: {
          fontFamily: 'Courier New',
        },
      }),
    },
    code_inline: {
      backgroundColor: colors.fullOpposite + '1A',
      borderColor: colors.fullOpposite + '4E',
      borderRadius: 4,
      borderWidth: 1,
      ...gutters.padding_12,
      ...Platform.select({
        ['android']: {
          fontFamily: 'monospace',
        },
        ['ios']: {
          fontFamily: 'Courier New',
        },
      }),
    },
    fence: {
      backgroundColor: colors.fullOpposite + '1A',
      borderColor: colors.fullOpposite + '4E',
      borderRadius: 4,
      borderWidth: 1,
      ...gutters.padding_12,
      ...Platform.select({
        ['android']: {
          fontFamily: 'monospace',
        },
        ['ios']: {
          fontFamily: 'Courier New',
        },
      }),
    },

    // Tables
    table: {
      borderColor: colors.gray200 + 'EE',
      borderRadius: 8,
      borderWidth: 1,
    },
    tbody: {},
    td: {
      ...layout.flex_1,
      ...gutters.padding_4,
      borderColor: colors.gray200 + '3E',
      borderRightWidth: 1,
    },
    th: {
      ...layout.flex_1,
      ...gutters.padding_4,
      backgroundColor: colors.purple100 + 'AE',
      borderBottomWidth: 1,
      borderColor: colors.gray200 + 'EE',
      borderRightWidth: 1,
    },
    thead: {},
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.gray200 + '3E',
      ...layout.row,
    },

    // Links
    blocklink: {
      borderBottomWidth: 1,
      borderColor: colors.purple500,
      ...layout.flex_1,
    },
    link: {
      ...fonts.defaultFontFamilyRegular,
      color: colors.purple500,
      textDecorationLine: 'underline',
    },

    // Images
    image: {
      ...layout.flex_1,
    },

    // Text Output
    hardbreak: {
      height: 1,
      ...layout.fullWidth,
    },
    paragraph: {
      ...layout.itemsStart,
      ...layout.row,
      ...layout.justifyStart,
      ...gutters.marginVertical_8,
      ...layout.fullWidth,
    },
    softbreak: {},
    text: {},
    textgroup: {},

    // Believe these are never used but retained for completeness
    inline: {},
    pre: {},
    span: {},
  });

  return <Markdown style={markdownStyles}>{markdown}</Markdown>;
}

export default MarkdownRenderer;
