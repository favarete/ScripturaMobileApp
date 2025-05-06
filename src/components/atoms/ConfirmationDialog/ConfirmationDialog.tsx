import type { PropsWithChildren } from 'react';

import Icon from '@react-native-vector-icons/material-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { EDIT_CHAPTER_TITLE_TYPE } from '@/components/molecules/ChapterCard/ChapterCard';
import {
  EDIT_DESCRIPTION_TYPE,
  EDIT_TITLE_TYPE,
} from '@/components/molecules/ProjectCard/ProjectCard';

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

  // This is fucking ugly, but I am tired of debugging the zIndex of the
  // reordering component
  // Probably I will need to come up with a fiz for the library
  const styles = StyleSheet.create({
    cancelButton: {
      backgroundColor: colors.full,
    },
    countLabel: {
      right:
        dialogType === EDIT_DESCRIPTION_TYPE
          ? 20
          : dialogType === EDIT_CHAPTER_TITLE_TYPE
            ? 0
            : -10,
      top: dialogType === EDIT_DESCRIPTION_TYPE ? 8 : -4,
      width: 50,
    },
    customButton: {
      alignItems: 'center',
      backgroundColor: colors.full,
      borderRadius: 45,
      elevation: 3,
      height: 60,
      justifyContent: 'center',
      marginRight: 11,
      padding: 5,
      shadowColor: colors.gray800,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      width: 60,
    },
    dialogContainer: {
      right:
        dialogType === EDIT_DESCRIPTION_TYPE
          ? -65
          : dialogType === EDIT_TITLE_TYPE
            ? -10
            : dialogType === EDIT_CHAPTER_TITLE_TYPE
              ? -40
              : -60,
      top:
        dialogType === EDIT_DESCRIPTION_TYPE
          ? -50
          : dialogType === EDIT_TITLE_TYPE ||
              dialogType === EDIT_CHAPTER_TITLE_TYPE
            ? 15
            : 0,
      zIndex: 999_999,
    },
    positionForeground: {
      zIndex: 999_999,
    },
    saveButton: {
      backgroundColor: colors.purple100,
    },
  });

  return (
    <View
      style={[
        styles.dialogContainer,
        dialogType === EDIT_TITLE_TYPE || dialogType === EDIT_CHAPTER_TITLE_TYPE
          ? layout.row
          : layout.col,
        layout.absolute,
        gutters.marginTop_12,
        styles.positionForeground,
      ]}
    >
      <TouchableOpacity
        onPress={() => handleDialogClick(dialogType, 'save')}
        style={[
          styles.customButton,
          styles.positionForeground,
          styles.saveButton,
          gutters.marginBottom_12,
        ]}
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
          gutters.marginBottom_12,
          styles.positionForeground,
        ]}
      >
        <Text>
          <Icon color={colors.red500} name="clear" size={30} />
        </Text>
      </TouchableOpacity>
      <View style={[styles.positionForeground, styles.countLabel]}>
        {children}
      </View>
    </View>
  );
}

export default ConfirmationDialog;
