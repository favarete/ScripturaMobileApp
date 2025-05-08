import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/theme';
import { useAtomValue } from 'jotai';
import { IsPortraitStateAtom } from '@/state/atoms/temporaryContent';

type Props = {
  title: string;
  value: string;
};

function InformationRow({ title, value }: Props) {
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const styles = StyleSheet.create({
    info: {
      ...fonts.defaultFontFamilySemibold,
      ...fonts.gray800,
      ...fonts.size_16,
    },
    itemContainer: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.marginVertical_8,
      ...gutters.marginHorizontal_16,
      ...gutters.padding_16,
      ...borders.rounded_4,
      backgroundColor: colors.full,
    },
    label: {
      ...fonts.defaultFontFamilyRegular,
      ...fonts.gray800,
      ...fonts.size_16,
    },
  });
  const isPortrait = useAtomValue(IsPortraitStateAtom);
  return (
      <View style={[styles.itemContainer, !isPortrait && gutters.marginHorizontal_160]}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.info}>{value}</Text>
      </View>
  );
}

export default InformationRow;
