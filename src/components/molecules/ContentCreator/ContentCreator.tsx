import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

interface ContentCreatorProps {
  createContent: (name: string) => void;
  subtitle: string;
  title: string;
}

const ContentCreator: React.FC<ContentCreatorProps> = ({
  createContent,
  subtitle,
  title,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [contentName, setContentName] = useState<string>('');

  const { t } = useTranslation();

  const { borders, colors, fonts, gutters, layout } = useTheme();

  const styles = StyleSheet.create({
    dialog: {
      backgroundColor: colors.full,
      width: '80%',
      ...borders.rounded_4,
      ...gutters.padding_20,
    },
    input: {
      borderColor: colors.gray800,
      borderWidth: 1,
      ...borders.rounded_4,
      ...fonts.size_16,
      ...fonts.gray800,
      ...gutters.padding_16,
      ...gutters.marginBottom_20,
      ...fonts.defaultFontFamilyRegular,
    },
    openButton: {
      backgroundColor: colors.gray200,
      width: 160,
      ...borders.rounded_4,
      ...gutters.paddingHorizontal_16,
      ...gutters.padding_8,
      ...gutters.marginTop_4,
      ...gutters.marginBottom_28,
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      ...layout.itemsCenter,
      ...layout.flex_1,
      ...layout.justifyCenter,
    },
    submitButton: {
      backgroundColor: colors.gray200,
      ...borders.rounded_4,
      ...gutters.paddingHorizontal_16,
      ...gutters.paddingVertical_8,
    },
  });

  const openModal = () => {
    setContentName('');
    setModalVisible(true);
  };

  const handleSubmit = () => {
    const name = contentName.trim();
    if (name) {
      createContent(name);
    }
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={openModal} style={styles.openButton}>
        <Text
          style={[
            fonts.defaultFontFamilyExtraBold,
            fonts.uppercase,
            fonts.full,
            fonts.size_12,
            fonts.alignCenter,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        transparent
        visible={modalVisible}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text
              style={[
                fonts.size_20,
                fonts.defaultFontFamilyBold,
                gutters.marginBottom_12,
              ]}
            >
              {subtitle}
            </Text>
            <TextInput
              autoFocus
              cursorColor={colors.purple500}
              keyboardType="default"
              onChangeText={setContentName}
              placeholder={t('screen_projects.enter_name')}
              selectionColor={colors.purple100}
              style={styles.input}
              value={contentName}
            />
            <View style={[layout.row, layout.justifyEnd]}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  gutters.marginRight_8,
                  gutters.paddingHorizontal_16,
                  gutters.paddingVertical_8,
                ]}
              >
                <Text
                  style={[
                    fonts.defaultFontFamilyBold,
                    fonts.uppercase,
                    fonts.fullOpposite,
                    fonts.size_12,
                  ]}
                >
                  {t('screen_projects.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                <Text
                  style={[
                    fonts.defaultFontFamilyBold,
                    fonts.uppercase,
                    fonts.full,
                    fonts.size_12,
                    fonts.alignCenter,
                  ]}
                >
                  {t('screen_projects.create')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContentCreator;
