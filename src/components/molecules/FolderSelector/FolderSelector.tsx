import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { pickDirectory } from 'react-native-document-picker';

import { useTheme } from '@/theme';

type Props = {
  placeholder: string;
};

const pickFolder =
  (setFolderPath: React.Dispatch<React.SetStateAction<string>>) =>
  async (): Promise<void> => {
    try {
      const result = await pickDirectory();
      if (result && result.uri) {
        const { uri } = result;
        setFolderPath(uri);
      } else {
        Alert.alert('Directory not selected. Projects will not be loaded');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        Alert.alert('An unknown error occurred.');
      }
    }
  };

const extractFriendlyPath = (androidPath: string): null | string => {
  try {
    const match = androidPath.match(/primary%3A(.+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).replaceAll('/', '/');
    }
    Alert.alert('Invalid path');
    return null;
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Error extracting path:');
    }
    return null;
  }
};

function FolderSelector({ placeholder }: Props) {
  const { borders, fonts, gutters } = useTheme();

  const [folderPath, setFolderPath] = useState<string>('');
  const [friendlyFolderName, setFriendlyFolderName] =
    useState<string>(placeholder);

  useEffect(() => {
    if (folderPath.trim().length > 0) {
      const getFriendlyFolderName = extractFriendlyPath(folderPath);
      if(getFriendlyFolderName){
        setFriendlyFolderName(getFriendlyFolderName);
      }
    }
  }, [folderPath]);

  return (
    <View
      style={[
        gutters.padding_16,
        borders.rounded_4,
        borders.gray400,
        borders.w_1,
      ]}
    >
      <TouchableOpacity onPress={pickFolder(setFolderPath)}>
        <Text style={[fonts.defaultFontFamilyRegular, fonts.gray400]}>
          {friendlyFolderName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FolderSelector;
