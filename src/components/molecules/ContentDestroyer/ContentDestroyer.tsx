import Icon from '@react-native-vector-icons/material-icons';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

interface ContentDestroyerProps {
  destroyContent: (shouldDestroy: boolean) => Promise<void>;
  show: boolean;
  title: string;
}

const ContentDestroyer: React.FC<ContentDestroyerProps> = ({
  destroyContent,
  show,
  title,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(show);
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const styles = StyleSheet.create({
    cancelButton: {
      backgroundColor: colors.full,
    },
    confirmButton: {
      backgroundColor: colors.gray200,
      ...borders.rounded_4,
      ...gutters.paddingHorizontal_16,
      ...gutters.paddingVertical_8,
    },
    customButton: {
      alignItems: 'center',
      backgroundColor: colors.full,
      borderRadius: 45,
      elevation: 3,
      height: 60,
      justifyContent: 'center',
      marginTop: 20,
      padding: 5,
      shadowColor: colors.gray800,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      width: 60,
    },
    dialog: {
      backgroundColor: colors.full,
      height: 70,
      width: '80%',
      ...layout.itemsCenter,
      ...layout.justifyCenter,
      ...borders.rounded_4,
      ...gutters.padding_20,
    },
    dialogContainer: {
      top: '100%',
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      ...layout.itemsCenter,
      ...layout.flex_1,
      ...layout.justifyCenter,
    },
    positionForeground: {
      zIndex: 999,
    },
    saveButton: {
      backgroundColor: colors.purple100,
    },
  });

  useEffect(() => {
    setModalVisible(show);
  }, [show]);

  const handleConfirm = async () => {
    await destroyContent(true);
    setModalVisible(false);
  };

  const handleDeny = async () => {
    await destroyContent(false);
    setModalVisible(false);
  };

  return (
    <View>
      <Modal
        animationType="fade"
        onRequestClose={handleDeny}
        transparent
        visible={modalVisible}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text
              style={[
                fonts.size_16,
                fonts.defaultFontFamilyBold,
                gutters.marginBottom_12,
              ]}
            >
              {title}
            </Text>
            <View
              style={[
                styles.dialogContainer,
                layout.row,
                layout.absolute,
                gutters.marginTop_12,
              ]}
            >
              <TouchableOpacity
                onPress={() => handleConfirm()}
                style={[
                  styles.customButton,
                  styles.positionForeground,
                  styles.saveButton,
                  gutters.marginRight_12,
                ]}
              >
                <Text>
                  <Icon color={colors.purple500} name="done" size={30} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeny()}
                style={[
                  styles.customButton,
                  styles.cancelButton,
                  gutters.marginRight_12,
                  styles.positionForeground,
                ]}
              >
                <Text>
                  <Icon color={colors.red500} name="clear" size={30} />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContentDestroyer;
