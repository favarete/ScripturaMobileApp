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
  LanguageStateAtom,
  ProjectsDataStateAtom,
} from '@/state/atoms/persistentContent';
import { formatNumber } from '@/utils/chapterHelpers';
import { findProjectById } from '@/utils/projectHelpers';

function StatisticsView({
  navigation,
  route,
}: RootScreenProps<Paths.StatisticsView>) {
  const { t } = useTranslation();
  const { chapterId, projectId } = route.params;
  const { colors, borders, fonts, gutters, layout } = useTheme();

  const language = useAtomValue(LanguageStateAtom);
  const allProjects = useAtomValue(ProjectsDataStateAtom);
  const actualProject = findProjectById(allProjects, projectId);

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
  });

  console.log(actualProject);

  const myData = [
    { label: 'SUN', value: 500 },
    { label: 'MON', value: 450 },
    { label: 'TUE', value: 300 },
    { label: 'WED', value: 280 },
    { label: 'THU', value: 1000 },
    { label: 'FRI', value: 150 },
    { label: 'SAT', value: 100 },
  ];

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
              data={myData}
              width={350}
              height={300}
              numberOfTicks={5}
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
            {t('screen_statistics.daily_word_goal')}
          </Text>
          <View style={[layout.row, gutters.marginHorizontal_40]}>
            <CircleProgress
              progress={0.25}
              progressColor={colors.fullOpposite}
              backgroundColor={colors.gray100}
              textColor={colors.gray400}
              textSize={18}
            />
            <View style={[layout.itemsCenter]}>
              <Text
                style={[
                  gutters.marginVertical_4,
                  fonts.defaultFontFamilySemibold,
                  fonts.gray800,
                  fonts.size_12,
                ]}
              >
                {t('screen_statistics.to_write_today')}
              </Text>
              <HorizontalProgressBar
                fillColor={colors.fullOpposite}
                backgroundColor={colors.gray100}
                progress={0.25}
                width={180}
                height={15}
              />
              <View
                style={[
                  layout.row,
                  layout.justifyAround,
                  layout.fullWidth,
                  gutters.marginVertical_4,
                ]}
              >
                <Text
                  style={[
                    fonts.defaultFontFamilySemibold,
                    fonts.gray200,
                    fonts.size_12,
                  ]}
                >
                  {250}
                </Text>
                <Text
                  style={[
                    fonts.defaultFontFamilySemibold,
                    fonts.gray200,
                    fonts.size_12,
                  ]}
                >
                  {formatNumber(1000, language)}
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
                  style={styles.editButton}
                  onPress={onNavigateSettings}
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
            <DataBox title={t('screen_statistics.words')} value={1234} />
            <DataBox title={t('screen_statistics.sentences')} value={1234} />
            <DataBox title={t('screen_statistics.pages')} value={1234} />
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
            <DataBox title={t('screen_statistics.words')} value={1234} />
            <DataBox title={t('screen_statistics.sentences')} value={1234} />
            <DataBox title={t('screen_statistics.pages')} value={1234} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default StatisticsView;
