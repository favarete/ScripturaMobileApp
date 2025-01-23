import { useAtomValue } from 'jotai/index';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import {
  calculatePages,
  calculatePercentage,
  formatNumber,
} from '@/utils/chapterHelpers';

type Props = {
  onNavigateToStatistics: () => void;
  wordCount: number;
  wordGoal: number;
  wordsWrittenToday: number;
};

function StatisticsBar({
  onNavigateToStatistics,
  wordCount,
  wordGoal,
  wordsWrittenToday,
}: Props) {
  const { backgrounds, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const language = useAtomValue(LanguageStateAtom);
  const styles = StyleSheet.create({
    statisticsBar: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.paddingHorizontal_20,
      ...gutters.paddingVertical_12,
    },
    statisticsBarContainer: {
      bottom: 0,
      height: 64,
      left: 0,
      position: 'absolute',
      right: 0,
      zIndex: 10,
    },
  });

  const formatedWordCount = formatNumber(wordCount, language);
  const wordCountLabel =
    wordCount === 1
      ? t('screen_content.words').slice(0, -1)
      : t('screen_content.words');

  const pageCount = calculatePages(wordCount);
  const pageCountLabel =
    pageCount === 1
      ? t('screen_content.pages').slice(0, -1)
      : t('screen_content.pages');

  const formatedWordGoalPercentage = calculatePercentage(
    wordsWrittenToday,
    wordGoal,
  );

  const formatedWordsWrittenToday = formatNumber(wordsWrittenToday, language);
  const formatedWordGoal = formatNumber(wordGoal, language);

  return (
    <View style={styles.statisticsBarContainer}>
      <TouchableOpacity onPress={onNavigateToStatistics}>
        <View style={[styles.statisticsBar, backgrounds.gray200, layout.row]}>
          <View style={[layout.col, layout.itemsStart]}>
            <Text
              style={[
                fonts.defaultFontFamilyBold,
                fonts.fullOpposite,
                fonts.size_16,
                fonts.full,
              ]}
            >
              {`${formatedWordCount} ${wordCountLabel}`}
            </Text>
            <Text
              style={[
                fonts.defaultFontFamilySemibold,
                fonts.fullOpposite,
                fonts.size_12,
                fonts.full,
              ]}
            >
              {`${formatNumber(pageCount, language)} ${pageCountLabel}`}
            </Text>
          </View>
          <View style={[layout.col, layout.itemsEnd]}>
            <Text
              style={[
                fonts.defaultFontFamilyBold,
                fonts.fullOpposite,
                fonts.size_16,
                fonts.full,
              ]}
            >
              {`${formatedWordGoalPercentage} ${t('screen_content.word_goal')}`}
            </Text>
            <Text
              style={[
                fonts.defaultFontFamilySemibold,
                fonts.fullOpposite,
                fonts.size_12,
                fonts.full,
              ]}
            >
              {`${formatedWordsWrittenToday}/${formatedWordGoal} ${t('screen_content.word_target')}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default StatisticsBar;
