import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import CardInformation from '@/components/atoms/CardInformation/CardInformation';

type AveragesProps = {
  daily: number;
  monthly: number;
  weekly: number;
};

function Averages({ daily, monthly, weekly }: AveragesProps) {
  const { fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[layout.col, gutters.marginTop_16, gutters.paddingLeft_32]}>
      <View>
        <Text
          style={[fonts.defaultFontFamilyBold, fonts.gray200, fonts.size_16]}
        >
          {t('screen_projects.averages_title')}
        </Text>
      </View>
      <View style={[layout.row, gutters.marginTop_8]}>
        <CardInformation label={t('screen_projects.daily')} value={Math.round(daily)} />
        <CardInformation label={t('screen_projects.weekly')} value={Math.round(weekly)} />
        <CardInformation label={t('screen_projects.monthly')} value={Math.round(monthly)} />
      </View>
    </View>
  );
}

export default Averages;
