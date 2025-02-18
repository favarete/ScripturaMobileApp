import type { RootScreenProps } from '@/navigation/types';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';

function StatisticsView({
  navigation,
  route,
}: RootScreenProps<Paths.StatisticsView>) {
  const { t } = useTranslation();
  const { chapterId, projectId } = route.params;
  const { colors, gutters, layout } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.full,
    },
  });

  const onNavigateBack = () => {
    navigation.navigate(Paths.ContentView, { chapterId, projectId });
  };

  return (
    <View style={[styles.container, layout.flex_1]}>
      <View style={gutters.marginBottom_16}>
        <View style={gutters.marginBottom_8}>
          <TitleBar
            onNavigateBack={onNavigateBack}
            title={t('screen_statistics.view_title')}
          />
        </View>
      </View>
    </View>
  );
}

export default StatisticsView;
