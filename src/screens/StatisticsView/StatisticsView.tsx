import type { RootScreenProps } from '@/navigation/types';

import { useAtomValue } from 'jotai/index';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import CircleProgress from '@/components/atoms/CircleProgress/CircleProgress';
import DataBox from '@/components/atoms/DataBox/DataBox';
import { HorizontalProgressBar } from '@/components/atoms/HorizontalProgress/HorizontalProgress';
import BarChart from '@/components/molecules/BarChart/BarChart';

import {
  DailyGoalModeStateAtom,
  LanguageStateAtom,
  ProjectsDataStateAtom,
  WordsWrittenTodayStateAtom,
  WritingStatsStateAtom,
} from '@/state/atoms/persistentContent';
import {
  calculatePages,
  formatNumber,
  getChapterById,
} from '@/utils/chapterHelpers';
import {
  calculatePercentageGoal,
  getAverageWrittenWords,
} from '@/utils/common';
import { findProjectById } from '@/utils/projectHelpers';

function StatisticsView({
  navigation,
  route,
}: RootScreenProps<Paths.StatisticsView>) {
  const { t } = useTranslation();
  const { chapterId, projectId } = route.params;
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const language = useAtomValue(LanguageStateAtom);
  const allProjects = useAtomValue(ProjectsDataStateAtom);
  const wordWrittenToday = useAtomValue(WordsWrittenTodayStateAtom);
  const writingStats = useAtomValue(WritingStatsStateAtom);
  const dailyGoalMode = useAtomValue(DailyGoalModeStateAtom);

  const actualProject = findProjectById(allProjects, projectId);
  const actualChapter = getChapterById(projectId, chapterId, allProjects);

  const onNavigateBack = () => {
    navigation.navigate(Paths.ContentView, { chapterId, projectId });
  };

  const onNavigateSettings = () => {
    navigation.navigate(Paths.SettingsView, { chapterId, projectId });
  };

  const styles = StyleSheet.create({
    editButton: {
      backgroundColor: colors.gray200,
      ...borders.rounded_4,
      ...gutters.paddingHorizontal_16,
      ...gutters.padding_8,
      ...gutters.marginTop_4,
      width: 60,
    },
    hide: {
      opacity: 0.4,
    },
  });

  const barChartData = [
    {
      label: t('screen_statistics.week.sun'),
      value: getAverageWrittenWords(writingStats.sunday),
    },
    {
      label: t('screen_statistics.week.mon'),
      value: getAverageWrittenWords(writingStats.monday),
    },
    {
      label: t('screen_statistics.week.tue'),
      value: getAverageWrittenWords(writingStats.tuesday),
    },
    {
      label: t('screen_statistics.week.wed'),
      value: getAverageWrittenWords(writingStats.wednesday),
    },
    {
      label: t('screen_statistics.week.thu'),
      value: getAverageWrittenWords(writingStats.thursday),
    },
    {
      label: t('screen_statistics.week.fri'),
      value: getAverageWrittenWords(writingStats.friday),
    },
    {
      label: t('screen_statistics.week.sat'),
      value: getAverageWrittenWords(writingStats.saturday),
    },
  ];

  const wordsToGo = (wordsValue: number) => {
    let wordToGo = dailyGoalMode.target - wordsValue
    if(wordToGo < 0) {
      wordToGo = 0;
    }
    return language === 'en-US'
      ? ` ${wordToGo} ${t('screen_statistics.toGo')}`
      : `${t('screen_statistics.toGo')} ${wordToGo}`;
  };

  return (
    <ScrollView style={layout.flex_1}>
      <View style={gutters.marginBottom_24}>
        <TitleBar
          onNavigateBack={onNavigateBack}
          title={t('screen_statistics.view_title')}
        />
      </View>
      {actualProject && (
        <View style={gutters.marginBottom_40}>
          <Text
            style={[
              fonts.defaultFontFamilyBold,
              fonts.size_20,
              fonts.fullOpposite,
              fonts.alignCenter,
              layout.itemsCenter,
            ]}
          >
            {actualProject.title}
          </Text>
          <Text
            style={[
              fonts.alignCenter,
              fonts.defaultFontFamilyBold,
              fonts.size_16,
              fonts.gray200,
              layout.itemsCenter,
              gutters.marginVertical_16,
            ]}
          >
            {t('screen_statistics.most_prolific_days')}
          </Text>
          <View style={[layout.fullWidth, layout.itemsCenter]}>
            <BarChart
              data={barChartData}
              height={300}
              numberOfTicks={5}
              width={350}
            />
          </View>
          <Text
            style={[
              fonts.alignCenter,
              fonts.defaultFontFamilyBold,
              fonts.size_16,
              fonts.gray200,
              fonts.alignCenter,
              layout.itemsCenter,
              gutters.marginVertical_16,
            ]}
          >
            {`${t('screen_statistics.daily_word_goal')} ${
              !dailyGoalMode.enabled
                ? t('screen_statistics.daily_word_goal_disabled')
                : ''
            }`}
          </Text>
          <View style={[layout.row, gutters.marginHorizontal_40]}>
            <View style={!dailyGoalMode.enabled && styles.hide}>
              <CircleProgress
                backgroundColor={colors.gray100}
                progress={
                  !dailyGoalMode.enabled
                    ? 1
                    : calculatePercentageGoal(
                        wordWrittenToday.value,
                        dailyGoalMode.target,
                      )
                }
                progressColor={colors.fullOpposite}
                textColor={colors.gray400}
                textSize={18}
              />
            </View>
            <View style={[layout.itemsCenter]}>
              <Text
                style={[
                  gutters.marginVertical_4,
                  fonts.defaultFontFamilySemibold,
                  fonts.gray800,
                  fonts.size_12,
                  !dailyGoalMode.enabled && styles.hide,
                ]}
              >
                {t('screen_statistics.to_write_today')}
              </Text>
              <View style={!dailyGoalMode.enabled && styles.hide}>
                <HorizontalProgressBar
                  backgroundColor={colors.gray100}
                  fillColor={colors.fullOpposite}
                  height={15}
                  progress={
                    !dailyGoalMode.enabled
                      ? 1
                      : calculatePercentageGoal(
                          wordWrittenToday.value,
                          dailyGoalMode.target,
                        )
                  }
                  width={180}
                />
              </View>
              <View
                style={[
                  layout.row,
                  layout.justifyAround,
                  layout.fullWidth,
                  gutters.marginVertical_4,
                  !dailyGoalMode.enabled && styles.hide,
                ]}
              >
                <Text
                  style={[
                    fonts.defaultFontFamilySemibold,
                    fonts.gray200,
                    fonts.size_12,
                  ]}
                >
                  {!dailyGoalMode.enabled
                    ? 0
                    : wordsToGo(wordWrittenToday.value)}
                </Text>
                <Text
                  style={[
                    fonts.defaultFontFamilySemibold,
                    fonts.gray200,
                    fonts.size_12,
                  ]}
                >
                  {!dailyGoalMode.enabled
                    ? 0
                    : formatNumber(dailyGoalMode.target, language)}
                </Text>
              </View>
              <View
                style={[
                  layout.itemsEnd,
                  layout.fullWidth,
                  gutters.marginRight_80,
                  gutters.marginTop_4,
                ]}
              >
                <TouchableOpacity
                  onPress={onNavigateSettings}
                  style={styles.editButton}
                >
                  <Text
                    style={[
                      fonts.defaultFontFamilyExtraBold,
                      fonts.uppercase,
                      fonts.full,
                      fonts.size_12,
                      fonts.alignCenter,
                    ]}
                  >
                    {t('screen_statistics.edit')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text
            style={[
              fonts.alignCenter,
              fonts.defaultFontFamilyBold,
              fonts.size_16,
              fonts.gray200,
              fonts.alignCenter,
              layout.itemsCenter,
              gutters.marginVertical_16,
            ]}
          >
            {t('screen_statistics.chapter_data')}
          </Text>
          <View style={[layout.row, layout.justifyCenter]}>
            <DataBox
              title={t('screen_statistics.words')}
              value={actualChapter?.wordCount ?? 0}
            />
            <DataBox
              title={t('screen_statistics.sentences')}
              value={actualChapter?.sentencesCount ?? 0}
            />
            <DataBox
              title={t('screen_statistics.pages')}
              value={calculatePages(actualChapter?.wordCount ?? 0)}
            />
          </View>
          <Text
            style={[
              fonts.alignCenter,
              fonts.defaultFontFamilyBold,
              fonts.size_16,
              fonts.gray200,
              fonts.alignCenter,
              layout.itemsCenter,
              gutters.marginVertical_16,
            ]}
          >
            {t('screen_statistics.project_data')}
          </Text>
          <View style={[layout.row, layout.justifyCenter]}>
            <DataBox
              title={t('screen_statistics.words')}
              value={actualProject?.wordCount ?? 0}
            />
            <DataBox
              title={t('screen_statistics.sentences')}
              value={actualProject?.sentencesCount ?? 0}
            />
            <DataBox
              title={t('screen_statistics.pages')}
              value={calculatePages(actualProject?.wordCount ?? 0)}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default StatisticsView;
