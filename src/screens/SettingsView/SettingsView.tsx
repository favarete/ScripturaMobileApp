import type { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

function SettingsView({ navigation }: RootScreenProps<Paths.SettingsView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();

  const onNavigate = () => {
    navigation.goBack();
  };
  return (
    <ScrollView>
      <View style={[gutters.paddingHorizontal_32, gutters.marginTop_40]}>
        <View style={[gutters.marginTop_40]}>
          <Text style={[fonts.size_40, fonts.gray800, fonts.bold]}>
            {t('screen_settings.title')}
          </Text>
          <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_40]}>
            {t('screen_settings.view')}
          </Text>
        </View>

        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.fullWidth,
            gutters.marginTop_16,
          ]}
        >
          <TouchableOpacity
            onPress={onNavigate}
            style={[components.buttonCircle, gutters.marginBottom_16]}
            testID="change-theme-button"
          >
            <IconByVariant path={'send'} stroke={colors.purple500} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default SettingsView;
