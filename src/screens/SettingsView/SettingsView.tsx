import type { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { TitleBar } from '@/components/atoms';
import InputSettingValue from '@/components/atoms/InputSettingValue/InputSettingValue';
import ToggleSwitchEntry from '@/components/atoms/ToggleSwitchEntry/ToggleSwitchEntry';

function SettingsView({ navigation }: RootScreenProps<Paths.SettingsView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();

  const [dailyWordGoal, setDailyWordGoal] = useState<boolean>(false);
  const [wordCountTarget, setWordCountTarget] = useState<number>(100);
  const [typewriterMode, setTypewriterMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const onNavigateBack = () => {
    Alert.alert('onNavigateBack');
    // updateChaptersById(projectId, allChapters);
    // navigation.navigate(Paths.ProjectsView);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.gray50 + '5F',
    },
  });

  return (
    <View style={[styles.container, layout.flex_1]}>
      <View style={gutters.marginBottom_16}>
        <View style={gutters.marginBottom_8}>
          <TitleBar
            onNavigateBack={onNavigateBack}
            title={t('screen_settings.view_title')}
          />
        </View>
        <ToggleSwitchEntry
          getter={dailyWordGoal}
          setter={setDailyWordGoal}
          title={t('screen_settings.daily_word_goal')}
        />
        <InputSettingValue
          getter={wordCountTarget}
          setter={setWordCountTarget}
          title={t('screen_settings.word_count_target')}
        />
        <ToggleSwitchEntry
          getter={typewriterMode}
          setter={setTypewriterMode}
          title={t('screen_settings.typewriter_mode')}
        />
        <ToggleSwitchEntry
          getter={darkMode}
          setter={setDarkMode}
          title={t('screen_settings.dark_mode')}
        />
      </View>
    </View>
  );
}

export default SettingsView;
