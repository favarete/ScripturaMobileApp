import Icon from '@react-native-vector-icons/material-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type ConfirmationDialogProps = {
  dialogType: string;
  handleDialogClick: (dialogType: string, action: string) => void;
};

function ProjectCard({
  dialogType,
  handleDialogClick,
}: ConfirmationDialogProps) {
  const { colors, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    cancelButton: {
      backgroundColor: colors.full,
    },
    customButton: {
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 45,
      elevation: 2,
      height: 60,
      justifyContent: 'center',
      padding: 5,
      shadowColor: colors.gray800,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      width: 60,
      zIndex: 20,
    },
    dialogContainer: {
      top: '100%',
    },
    saveButton: {
      backgroundColor: colors.purple100,
    },
  });

  return (
    <View
      style={[
        styles.dialogContainer,
        layout.row,
        layout.absolute,
      ]}
    >
      <TouchableOpacity
        onPress={() => handleDialogClick(dialogType, 'save')}
        style={[styles.customButton, styles.saveButton, gutters.marginRight_12]}
      >
        <Text>
          <Icon color={colors.purple500} name="done" size={30} />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDialogClick(dialogType, 'cancel')}
        style={[styles.customButton, styles.cancelButton, gutters.marginRight_12]}
      >
        <Text>
          <Icon color={colors.red500}  name="clear" size={30} />
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default ProjectCard;
