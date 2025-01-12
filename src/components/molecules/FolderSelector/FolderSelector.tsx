import type { TFunction } from 'i18next';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { pickDirectory } from 'react-native-document-picker';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';

import { print } from '@/utils/logger';

const pickFolder =
  (
    setFolderPath: React.Dispatch<React.SetStateAction<string>>,
    t: TFunction<'scripturaeditor', undefined>,
  ) =>
    async (): Promise<void> => {
      try {
        const result = await pickDirectory();
        if (result && result.uri) {
          const { uri } = result;
          setFolderPath(uri);
          Toast.show({
            text1: t(
              'components.folder_selector.director_selected_success.text1',
            ),
            text2: t(
              'components.folder_selector.director_selected_success.text2',
            ),
            type: 'success',
          });
        } else {
          Toast.show({
            text1: t(
              'components.folder_selector.director_selected_failure.text1',
            ),
            text2: t(
              'components.folder_selector.director_selected_failure.text2',
            ),
            type: 'error',
          });
        }
      } catch (error) {
        print(error, {
          text1: t('unknown_error.text1'),
          text2: t('unknown_error.text2'),
          type: 'error',
        });
      }
    };

const extractFriendlyPath = (
  androidPath: string,
  t: TFunction<'scripturaeditor', undefined>,
): null | string => {
  try {
    const match = androidPath.match(/primary%3A(.+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).replaceAll('/', '/');
    }
    Toast.show({
      text1: t('components.folder_selector.invalid_path.text1'),
      text2: t('components.folder_selector.invalid_path.text2'),
      type: 'error',
    });
    return null;
  } catch (error) {
    print(error, {
      text1: t('unknown_error.text1'),
      text2: t('unknown_error.text2'),
      type: 'error',
    });
    return null;
  }
};

function FolderSelector() {
  const { borders, fonts, gutters } = useTheme();
  const { i18n, t } = useTranslation();

  const [folderPath, setFolderPath] = useState<string>('');
  const [friendlyFolderName, setFriendlyFolderName] = useState<string>(
    t('screen_projects.placeholder'),
  );

  // Atualiza o friendlyFolderName ao alterar o idioma
  useEffect(() => {
    if (!folderPath.trim()) {
      // Atualiza o placeholder quando o idioma muda
      setFriendlyFolderName(t('screen_projects.placeholder'));
    }
  }, [i18n.language, t, folderPath]);

  // Atualiza o friendlyFolderName com base no folderPath
  useEffect(() => {
    if (folderPath.trim().length > 0) {
      const getFriendlyFolderName = extractFriendlyPath(folderPath, t);
      if (getFriendlyFolderName) {
        setFriendlyFolderName(getFriendlyFolderName);
      }
    }
  }, [folderPath, t]);

  return (
    <View
      style={[
        gutters.padding_16,
        borders.rounded_4,
        borders.gray400,
        borders.w_1,
      ]}
    >
      <TouchableOpacity onPress={pickFolder(setFolderPath, t)}>
        <Text style={[fonts.defaultFontFamilyRegular, fonts.gray400]}>
          {friendlyFolderName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FolderSelector;
