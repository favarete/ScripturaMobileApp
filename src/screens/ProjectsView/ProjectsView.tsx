import type { DocumentFileDetail } from 'react-native-saf-x';
import type { RootScreenProps } from '@/navigation/types';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { hasPermission, listFiles } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { IconByVariant } from '@/components/atoms';
import { FolderSelector } from '@/components/molecules';
import ProjectCard from '@/components/molecules/ProjectCard/ProjectCard';
import { SafeScreen } from '@/components/templates';

import {
  AllProjectsStateAtom,
  HomeFolderStateAtom,
} from '@/state/atoms/settings';
import { print } from '@/utils/logger';

function ProjectsView({ navigation }: RootScreenProps<Paths.ProjectsView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();

  const homeFolder = useRecoilValue(HomeFolderStateAtom);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [allProjectsFound, setAllProjectsFound] =
    useRecoilState(AllProjectsStateAtom);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const permissionToHomeFolder = await hasPermission(homeFolder);

        if (!permissionToHomeFolder) {
          Toast.show({
            text1: t('components.folder_selector.permission_error.text1'),
            text2: t('components.folder_selector.permission_error.text2'),
            type: 'error',
          });
        } else {
          const allFiles = await listFiles(homeFolder);
          const allFolders = allFiles.filter(
            (item) => item.type === 'directory' && !item.name.startsWith('.'),
          );

          setAllProjectsFound(allFolders);
        }
      } catch (error) {
        Toast.show({
          text1: t('unknown_error.text1'),
          text2: t('unknown_error.text2'),
          type: 'error',
        });
        print(error);
      } finally {
        setLoadingProjects(false);
      }
    };

    void fetchAllProjects();
  }, [homeFolder, setAllProjectsFound, t]);

  const onNavigate = () => {
    navigation.navigate(Paths.ChaptersView);
    // changeLanguage(i18next.language === SupportedLanguages.EN_EN
    //   ? SupportedLanguages.PT_BR
    //   : SupportedLanguages.EN_EN,);
  };

  return (
    <SafeScreen>
      <ScrollView>
        <View style={[gutters.paddingHorizontal_32]}>
          <View style={[gutters.marginTop_40]}>
            <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
              {t('screen_projects.title')}
            </Text>
            <Text
              style={[fonts.size_16, fonts.gray200, gutters.marginBottom_40]}
            >
              {t('screen_projects.view')}
            </Text>
          </View>
          <FolderSelector />
          <View key={homeFolder}>
            {loadingProjects ? (
              <Text>Loading...</Text>
            ) : allProjectsFound.length > 0 ? (
              allProjectsFound.map((project: DocumentFileDetail) => {
                return <Text key={project.name}>{project.name}</Text>;
              })
            ) : (
              <Text>No projects available</Text>
            )}
          </View>
          <View>
            <ProjectCard
              description={
                'Curabitur ac ligula non libero vehicula interdum sit amet eget velit. Phasellus viverra. Curabitur ac ligula non libero vehicula interdum sit amet eget velit.'
              }
              id={'1'}
              image={null}
              title={'Another Project'}
            />
          </View>
          <View
            style={[
              layout.row,
              layout.justifyBetween,
              layout.fullWidth,
              gutters.marginTop_16,
            ]}
          >
            <TouchableOpacity
              onPress={onNavigate}
              style={[components.buttonCircle, gutters.marginBottom_16]}
              testID="change-theme-button"
            >
              <IconByVariant path={'send'} stroke={colors.purple500} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

export default ProjectsView;
