import { useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

import { TypewriterModeStateAtom } from '@/state/atoms/persistentContent';
import { IsPortraitStateAtom } from '@/state/atoms/temporaryContent';

type Props = {
  disabled?: boolean;
  getter: number;
  setter: (action: number) => void;
  title: string;
};

function InputSettingValue({ disabled = false, getter, setter, title }: Props) {
  const { borders, colors, fonts, gutters, layout } = useTheme();
  const typewriterMode = useAtomValue(TypewriterModeStateAtom);

  const isPortrait = useAtomValue(IsPortraitStateAtom);

  const styles = StyleSheet.create({
    disabled: {
      opacity: disabled ? 0.5 : 1,
    },
    input: {
      borderColor: colors.gray800,
      ...borders.rounded_4,
      ...fonts.size_16,
      ...fonts.gray800,
      borderWidth: 1,
      ...gutters.padding_16,
      ...fonts.defaultFontFamilyRegular,
      height: 54,
      textAlign: 'left',
      width: 100,
    },
    itemContainer: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.marginVertical_8,
      ...borders.rounded_4,
      backgroundColor: colors.full,
    },
    label: {
      ...fonts.defaultFontFamilyRegular,
      ...fonts.gray800,
      ...fonts.size_16,
    },
    mainContainer: {
      ...layout.itemsCenter,
      ...layout.row,
    },
  });

  return (
    <View
      style={[
        styles.mainContainer,
        styles.disabled,
        !isPortrait && gutters.marginHorizontal_160,
      ]}
    >
      <View
        style={[
          styles.itemContainer,
          gutters.padding_16,
          layout.flex_1,
          gutters.marginRight_16,
          isPortrait && gutters.marginLeft_16,
        ]}
      >
        <Text style={styles.label}>{title}</Text>
      </View>
      <View
        style={[styles.itemContainer, isPortrait && gutters.marginRight_16]}
      >
        <TextInput
          cursorColor={colors.purple500}
          editable={!disabled}
          keyboardType="numeric"
          onChangeText={(text) => setter(Number.parseInt(text, 10) || 0)}
          selectionColor={colors.purple100}
          showSoftInputOnFocus={!typewriterMode}
          style={styles.input}
          value={getter.toString()}
        />
      </View>
    </View>
  );
}

export default InputSettingValue;
