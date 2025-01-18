import type { PropsWithChildren } from 'react';

import Icon from '@react-native-vector-icons/material-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type ConfirmationDialogProps = PropsWithChildren<{
  dialogType: string;
  handleDialogClick: (dialogType: string, action: string) => void;
}>;

function ConfirmationDialog({
  children = false,
  dialogType,
  handleDialogClick,
}: ConfirmationDialogProps) {
  const { colors, gutters, layout } = useTheme();

  const styles = StyleSheet.create({
    cancelButton: {
      backgroundColor: colors.full,
    },
    customButton: {
      alignItems: 'center',
      backgroundColor: colors.full,
      borderRadius: 45,
      elevation: 3,
      height: 60,
      justifyContent: 'center',
      padding: 5,
      shadowColor: colors.gray800,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      width: 60,
    },
    dialogContainer: {
      top: '100%',
    },
    positionForeground: {
      zIndex: 999,
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
        gutters.marginTop_12,
      ]}
    >
      <TouchableOpacity
        onPress={() => handleDialogClick(dialogType, 'save')}
        style={[styles.customButton, styles.positionForeground, styles.saveButton, gutters.marginRight_12]}
      >
        <Text>
          <Icon color={colors.purple500} name="done" size={30} />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDialogClick(dialogType, 'cancel')}
        style={[
          styles.customButton,
          styles.cancelButton,
          gutters.marginRight_12,
          styles.positionForeground
        ]}
      >
        <Text>
          <Icon color={colors.red500} name="clear" size={30} />
        </Text>
      </TouchableOpacity>
      <View style={styles.positionForeground}>{children}</View>
    </View>
  );
}

export default ConfirmationDialog;
