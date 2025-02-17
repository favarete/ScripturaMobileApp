import type { SupportedLanguages } from '@/hooks/language/schema';
import type { RootScreenProps } from '@/navigation/types';

import { useAtom } from 'jotai';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { languages } from '@/hooks/language/schema';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import ActionLongButton from '@/components/atoms/ActionLongButton/ActionLongButton';
import InformationRow from '@/components/atoms/InformationRow/InformationRow';
import InputSettingValue from '@/components/atoms/InputSettingValue/InputSettingValue';
import SelectionList from '@/components/atoms/SelectionList/SelectionList';
import ToggleSwitchEntry from '@/components/atoms/ToggleSwitchEntry/ToggleSwitchEntry';

import {
  DailyGoalModeStateAtom,
  LanguageStateAtom,
  ThemeStateAtom,
  TypewriterModeStateAtom,
} from '@/state/atoms/persistentContent';

function SettingsView({
  navigation,
  route,
}: RootScreenProps<Paths.SettingsView>) {
  const { t } = useTranslation();
  const { chapterId, projectId } = route.params;
  const { colors, gutters, layout } = useTheme();

  const [selectedLanguage, setSelectedLanguage] = useAtom(LanguageStateAtom);
  const [dailyWordGoal, setDailyWordGoal] = useAtom(DailyGoalModeStateAtom);
  const [typewriterMode, setTypewriterMode] = useAtom(TypewriterModeStateAtom);
  const [variant, setVariant] = useAtom(ThemeStateAtom);

  const onNavigateBack = () => {
    if (chapterId.length + projectId.length === 0) {
      navigation.navigate(Paths.ProjectsView);
    }
  };

  const onChangeLanguage = (newLanguage: SupportedLanguages) => {
    setSelectedLanguage(newLanguage);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.gray50 + '5F',
    },
  });

  const updateWordGoalModeInfo = (action: boolean | number) => {
    if (typeof action === 'boolean') {
      setDailyWordGoal((prevState) => ({
        ...prevState,
        enabled: action,
      }));
    } else {
      setDailyWordGoal((prevState) => ({
        ...prevState,
        target: action,
      }));
    }
  };

  const changeTheme = useCallback(
    (darkModeEnabled: boolean) => {
      setVariant(darkModeEnabled ? 'dark' : 'default');
    },
    [setVariant],
  );

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
          getter={dailyWordGoal.enabled}
          setter={updateWordGoalModeInfo}
          title={t('screen_settings.daily_word_goal')}
        />
        <InputSettingValue
          disabled={!dailyWordGoal.enabled}
          getter={dailyWordGoal.target}
          setter={updateWordGoalModeInfo}
          title={t('screen_settings.word_count_target')}
        />
        <SelectionList
          modalTitle={t('screen_settings.select_language')}
          onSelect={onChangeLanguage}
          options={languages}
          selectedOption={selectedLanguage}
          title={t('screen_settings.language')}
        />
        <ToggleSwitchEntry
          getter={typewriterMode}
          setter={setTypewriterMode}
          title={t('screen_settings.typewriter_mode')}
        />
        <ToggleSwitchEntry
          getter={variant === 'dark'}
          setter={changeTheme}
          title={t('screen_settings.dark_mode')}
        />
        <ActionLongButton
          command={{
            action: 'navigate',
            data: 'https://github.com/favarete/ScripturaMobileApp',
          }}
          title={t('screen_settings.donate')}
        />
        <ActionLongButton
          command={{
            action: 'share',
            data: 'https://github.com/favarete/ScripturaMobileApp',
          }}
          title={t('screen_settings.share')}
        />
        <ActionLongButton
          command={{
            action: 'contact',
            data: 'rodrigo@favarete.art',
          }}
          title={t('screen_settings.contact_me')}
        />
        <InformationRow
          title={t('screen_settings.version')}
          value={t('common_appName.code')}
        />
      </View>
    </View>
  );
}

export default SettingsView;
