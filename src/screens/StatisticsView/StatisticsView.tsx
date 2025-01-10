import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

function StatisticsView({ navigation }: RootScreenProps<Paths.StatisticsView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();

  const onNavigate = () => {
    navigation.navigate(Paths.SettingsView);
  };
  return (
    <ScrollView>
      <View style={[gutters.paddingHorizontal_32, gutters.marginTop_40]}>
        <View style={[gutters.marginTop_40]}>
          <Text style={[fonts.size_40, fonts.gray800, fonts.bold]}>
            {t('screen_statistics.title')}
          </Text>
          <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_40]}>
            {t('screen_statistics.view')}
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

export default StatisticsView;
