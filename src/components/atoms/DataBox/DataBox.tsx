import { useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import { formatNumber } from '@/utils/chapterHelpers';

type Props = {
  title: string;
  value: number;
};

function DataBox({ title, value }: Props) {
  const { borders, colors, fonts, gutters, layout } = useTheme();
  const language = useAtomValue(LanguageStateAtom);

  const SQUARE_SIZE = 100;
  const styles = StyleSheet.create({
    dataBox: {
      backgroundColor: colors.gray50 + 'AF',
      width: SQUARE_SIZE,
      height: SQUARE_SIZE,
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...borders.rounded_4,
      ...gutters.marginHorizontal_4,
    },
  });

  return (
    <View style={styles.dataBox}>
      <View style={layout.itemsStart}>
        <Text
          style={[
            fonts.size_20,
            fonts.fullOpposite,
            fonts.defaultFontFamilySemibold,
            gutters.marginBottom_4
          ]}
        >
          {formatNumber(value, language)}
        </Text>
        <Text
          style={[
            fonts.size_12,
            fonts.uppercase,
            fonts.defaultFontFamilyBold,
            fonts.gray200,
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

export default DataBox;
