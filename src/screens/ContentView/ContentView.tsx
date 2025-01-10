import type { RootScreenProps } from '@/navigation/types';

import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { IconByVariant } from '@/components/atoms';
import { TitleBar } from '@/components/molecules';

function ContentView({ navigation }: RootScreenProps<Paths.ContentView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();

  const onNavigate = () => {
    navigation.navigate(Paths.StatisticsView);
  };
  return (
    <ScrollView>
      <TitleBar title="jsaijsiajsi" />
      <View style={[gutters.paddingHorizontal_32]}>
        <View>
          <Text style={[fonts.size_40, fonts.gray800, fonts.bold]}>
            {t('screen_content.title')}
          </Text>
          <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_40]}>
            {t('screen_content.view')}
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

export default ContentView;
