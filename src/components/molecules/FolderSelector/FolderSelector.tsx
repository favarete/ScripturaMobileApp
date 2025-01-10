import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { pickDirectory } from 'react-native-document-picker';

type Props = {
  placeholder: string;
};

const pickFolder = async (): Promise<void> => {
  try {
    console.warn(uri)
  } catch (error) {
    // see error handling section
    console.error(error)
  }
}

function FolderSelector({ placeholder }: Props) {
  const { borders, fonts, gutters } = useTheme();

  return (
    <View
      style={[
        gutters.padding_16,
        borders.rounded_4,
        borders.gray400,
        borders.w_1,
      ]}
    >
      <TouchableOpacity onPress={pickFolder}>
        <Text style={[fonts.defaultFontFamilyRegular, fonts.gray400]}>
          {placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FolderSelector;
