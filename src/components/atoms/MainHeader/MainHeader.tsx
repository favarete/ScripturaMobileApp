import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAtomValue } from 'jotai/index';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import { formatNumber } from '@/utils/chapterHelpers';

type MainHeaderProps = {
  onNavigateSettings: () => void;
  streak: number;
};

function MainHeader({ onNavigateSettings, streak }: MainHeaderProps) {
  const { colors, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const language = useAtomValue(LanguageStateAtom);

  const styles = StyleSheet.create({
    icon: {
      ...gutters.paddingRight_8,
    },
  });

  const formatStreakNumber = formatNumber(streak, language);
  const streakCountLabel =
    streak === 1
      ? t('screen_projects.days').slice(0, -1)
      : t('screen_projects.days');

  return (
    <View
      style={[
        layout.row,
        layout.justifyBetween,
        layout.itemsEnd,
        gutters.marginTop_20,
        gutters.marginBottom_8,
      ]}
    >
      <View style={gutters.paddingLeft_32}>
        <Text
          style={[fonts.defaultFontFamilyBold, fonts.gray200, fonts.size_16]}
        >
          {t('screen_projects.writing_streak')}
        </Text>
        <Text
          style={[
            fonts.defaultFontFamilySemibold,
            fonts.fullOpposite,
            fonts.size_32,
          ]}
        >
          {`${formatStreakNumber} ${streakCountLabel}`}
        </Text>
      </View>
      <TouchableOpacity onPress={onNavigateSettings}>
        <View style={[gutters.paddingRight_32, layout.row, layout.itemsCenter]}>
          <Text style={styles.icon}>
            <MaterialIcons color={colors.gray200} name="settings" size={25} />
          </Text>
          <Text
            style={[
              fonts.defaultFontFamilyBold,
              fonts.fullOpposite,
              fonts.size_16,
              gutters.paddingVertical_8,
            ]}
          >
            {t('screen_projects.settings')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default MainHeader;
