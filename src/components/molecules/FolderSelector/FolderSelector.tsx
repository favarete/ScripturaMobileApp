import type { TFunction } from 'i18next';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { mkdir, openDocumentTree } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';
import { useRecoilState } from 'recoil';

import { useTheme } from '@/theme';

import { HomeFolderStateAtom } from '@/state/atoms/settings';
import { print } from '@/utils/logger';

const pickFolder =
  (
    setFolderPath: (folderPath: string) => void,
    t: TFunction<'scripturaeditor', undefined>,
  ) =>
  async (): Promise<void> => {
    try {
      const result = await openDocumentTree(true);

      if (result && result.uri) {
        const { uri } = result;
        await mkdir(uri + '/.scriptura');
        setFolderPath(uri);
        Toast.show({
          text1: t(
            'components.folder_selector.directory_selected_success.text1',
          ),
          text2: t(
            'components.folder_selector.directory_selected_success.text2',
          ),
          type: 'success',
        });
      } else {
        Toast.show({
          text1: t(
            'components.folder_selector.directory_selected_failure.text1',
          ),
          text2: t(
            'components.folder_selector.directory_selected_failure.text2',
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
    const lastElement = androidPath.split(":").pop();
    if (lastElement && lastElement.length > 0) {
      return lastElement;
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
  const [homeFolder, setHomeFolder] = useRecoilState(HomeFolderStateAtom);

  const { t } = useTranslation();

  const [friendlyFolderName, setFriendlyFolderName] = useState<string>(
    t('screen_projects.placeholder'),
  );

  useEffect(() => {
    if (homeFolder.length === 0) {
      setFriendlyFolderName(t('screen_projects.placeholder'));
    }
    else {
      const getFriendlyFolderName = extractFriendlyPath(homeFolder, t);
      if (getFriendlyFolderName) {
        setFriendlyFolderName(getFriendlyFolderName);
      }
    }
  }, [t, homeFolder]);

  return (
    <View
      style={[
        gutters.padding_16,
        borders.rounded_4,
        borders.gray400,
        borders.w_1,
      ]}
    >
      <TouchableOpacity onPress={pickFolder(setHomeFolder, t)}>
        <Text style={[fonts.defaultFontFamilyRegular, fonts.gray400]}>
          {friendlyFolderName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FolderSelector;
