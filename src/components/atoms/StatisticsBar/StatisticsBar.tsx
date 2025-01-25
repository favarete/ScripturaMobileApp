import FeatherIcons from '@react-native-vector-icons/feather';
import { useAtomValue } from 'jotai/index';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import {
  calculatePages,
  calculatePercentage,
  formatNumber,
} from '@/utils/chapterHelpers';

type Props = {
  onNavigateToStatistics: () => void;
  onSave?: (() => void) | false;
  viewMode?: boolean;
  wordCount: number;
  wordGoal: number;
  wordsWrittenToday: number;
};

function StatisticsBar({
  onNavigateToStatistics,
  onSave = false,
  viewMode = false,
  wordCount,
  wordGoal,
  wordsWrittenToday,
}: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const language = useAtomValue(LanguageStateAtom);
  const styles = StyleSheet.create({
    saveButton: {
      bottom: 40,
      position: 'absolute',
      right: 12,
    },
    statisticsBar: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.paddingHorizontal_20,
      paddingVertical: viewMode ? 12 : 4,
    },
    statisticsBarContainer: {
      bottom: -1,
      height: viewMode ? 64 : 32,
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
      {!viewMode && onSave && (
        <View style={[layout.col, styles.saveButton]}>
          <TouchableOpacity onPress={onSave}>
            <FeatherIcons color={colors.gray200} name={'save'} size={30} />
          </TouchableOpacity>
        </View>
      )}
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
            {viewMode && (
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
            )}
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
            {viewMode && (
              <Text
                style={[
                  fonts.defaultFontFamilySemibold,
                  fonts.fullOpposite,
                  fonts.size_12,
                  fonts.full,
                ]}
              >
                {`${formatedWordsWrittenToday}/${formatedWordGoal} ${wordCountLabel}`}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default StatisticsBar;
