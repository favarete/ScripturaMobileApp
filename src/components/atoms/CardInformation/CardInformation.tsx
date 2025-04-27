import { useAtomValue } from 'jotai';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import { formatNumber } from '@/utils/chapterHelpers';

type CardInformationProps = {
  label: string;
  value: number;
};

function CardInformation({ label, value }: CardInformationProps) {
  const { fonts, gutters, layout } = useTheme();
  const language = useAtomValue(LanguageStateAtom);

  const formatValue = formatNumber(value, language);

  return (
    <View style={[layout.col, layout.justifyStart, gutters.marginRight_24]}>
      <Text
        style={[
          fonts.defaultFontFamilyExtraBold,
          fonts.fullOpposite,
          fonts.size_20,
        ]}
      >
        {formatValue}
      </Text>
      <Text
        style={[fonts.defaultFontFamilySemibold, fonts.gray200, fonts.size_16]}
      >
        {label}
      </Text>
    </View>
  );
}

export default CardInformation;
