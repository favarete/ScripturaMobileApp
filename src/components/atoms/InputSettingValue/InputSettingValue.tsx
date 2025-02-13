import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  getter: number;
  setter: React.Dispatch<React.SetStateAction<number>>;
  title: string;
};

function InputSettingValue({ getter, setter, title }: Props) {
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const styles = StyleSheet.create({
    input: {
      borderColor: colors.gray800,
      ...borders.rounded_4,
      ...fonts.size_16,
      borderWidth: 1,
      ...gutters.padding_16,
      height: 54,
      textAlign: 'left',
      width: 100,
    },
    itemContainer: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.marginVertical_8,
      ...gutters.marginLeft_16,
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
    <View style={styles.mainContainer}>
      <View style={[styles.itemContainer, gutters.padding_16, layout.flex_1]}>
        <Text style={styles.label}>{title}</Text>
      </View>
      <View style={[styles.itemContainer, gutters.marginRight_16]}>
        <TextInput
          cursorColor={colors.purple500}
          keyboardType="numeric"
          onChangeText={(text) => setter(Number.parseInt(text, 10) || 0)}
          selectionColor={colors.gray200}
          style={styles.input}
          value={getter.toString()}
        />
      </View>
    </View>
  );
}

export default InputSettingValue;
