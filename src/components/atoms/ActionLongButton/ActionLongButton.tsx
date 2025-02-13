import FeatherIcons from '@react-native-vector-icons/feather';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';

import { print } from '@/utils/logger';

type Props = {
  command: {
    action: 'contact' | 'navigate' | 'share';
    data: string;
  };
  title: string;
};

function ActionLongButton({ command, title }: Props) {
  const { t } = useTranslation();
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const openURL = () => {
    Linking.openURL(command.data).catch((error) => {
      Toast.show({
        text1: t('screen_settings.action_buttons.main'),
        text2: t('screen_settings.action_buttons.link'),
        type: 'error',
      });
      print(error);
    });
  };

  const shareText = async () => {
    const message: string = `${t('screen_settings.action_buttons.share_text')} ${command.data}`;
    try {
      await Share.share({ message });
    } catch (error) {
      Toast.show({
        text1: t('screen_settings.action_buttons.main'),
        text2: t('screen_settings.action_buttons.share'),
        type: 'error',
      });
      print(error);
    }
  };

  const sendEmail = () => {
    const appLabel: string = `${t('common_appName.full')} ${t('common_appName.version')}`;
    const subject: string = `${t('screen_settings.contact_me')}: ${appLabel}`;
    const mailto = `mailto:${command.data}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(mailto).catch((error) => {
      Toast.show({
        text1: t('screen_settings.action_buttons.main'),
        text2: t('screen_settings.action_buttons.mail'),
        type: 'error',
      });
      print(error);
    });
  };

  const getAction = () => {
    switch (command.action) {
      case 'contact':
        return sendEmail();
      case 'navigate':
        return openURL();
      case 'share':
        return shareText();
      default:
        return null;
    }
  }

  const styles = StyleSheet.create({
    itemContainer: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.marginVertical_8,
      ...gutters.marginHorizontal_16,
      ...gutters.padding_16,
      ...borders.rounded_4,
      backgroundColor: colors.full,
    },
    label: {
      ...fonts.defaultFontFamilyRegular,
      ...fonts.gray800,
      ...fonts.size_16,
    },
  });

  return (
    <TouchableOpacity onPress={getAction}>
      <View style={styles.itemContainer}>
        <Text style={styles.label}>{title}</Text>
        <FeatherIcons
          color={colors.fullOpposite}
          name={'chevron-right'}
          size={20}
        />
      </View>
    </TouchableOpacity>
  );
}

export default ActionLongButton;
