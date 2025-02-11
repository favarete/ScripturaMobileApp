import type { Translations } from '@/translations/types';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createFile, exists, mkdir, openDocumentTree, writeFile } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';

import { HomeFolderStateAtom } from '@/state/atoms/persistentContent';
import { print } from '@/utils/logger';
import { getNameAlias } from '@/utils/common';

const pickFolder =
  (setHomeFolder: (folderPath: string) => void, t: Translations) =>
  async (): Promise<void> => {
    try {
      const result = await openDocumentTree(true);
      if (result && result.uri) {
        const { uri } = result;
        const supportFolder = `${uri}/.scriptura`;
        const supportFolderExists = await exists(supportFolder);
        if (!supportFolderExists) {
          await mkdir(supportFolder);
          await mkdir(`${supportFolder}/covers`);
          const nameAlias = getNameAlias(uri);

          const projectsFile = `${supportFolder}/${nameAlias}.json`
          await createFile(projectsFile)
          await writeFile(projectsFile, JSON.stringify([], null, 2));
        }

        // Create Default Persistent Values
        setHomeFolder(uri);
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
  t: Translations,
): null | string => {
  try {
    const lastElement = androidPath.split(':').pop();
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
  const { borders, colors, fonts, gutters } = useTheme();
  const [homeFolder, setHomeFolder] = useAtom(HomeFolderStateAtom);

  const { t } = useTranslation();

  const [friendlyFolderName, setFriendlyFolderName] = useState<string>(
    t('screen_projects.placeholder'),
  );

  useEffect(() => {
    if (homeFolder.length === 0) {
      setFriendlyFolderName(t('screen_projects.placeholder'));
    } else {
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
        gutters.marginVertical_12,
        borders.rounded_4,
        borders.gray400,
        borders.w_1,
      ]}
    >
      <TouchableOpacity onPress={pickFolder(setHomeFolder, t)}>
        <View>
          <Text style={[fonts.defaultFontFamilyRegular, fonts.gray400]}>
            {friendlyFolderName}
          </Text>
          <Text style={styles.icon}>
            <MaterialIcons color={colors.gray200} name="search" size={25} />
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    right: 0,
    top: -3,
  },
});

export default FolderSelector;
