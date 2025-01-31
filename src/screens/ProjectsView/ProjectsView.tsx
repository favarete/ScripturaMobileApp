import type { RootScreenProps } from '@/navigation/types';
import type { Project } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import {
  copyFile,
  createFile,
  DocumentFileDetail,
  exists,
  hasPermission,
  listFiles,
  mkdir,
  openDocument,
  openDocumentTree,
  rename,
} from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import { FolderSelector } from '@/components/molecules';
import ProjectCard from '@/components/molecules/ProjectCard/ProjectCard';
import { SafeScreen } from '@/components/templates';

import {
  HomeFolderStateAtom,
  LanguageStateAtom,
  ProjectsDataStateAtom,
} from '@/state/atoms/persistentContent';
import { initialProjectContent } from '@/state/defaults';
import { createNewUUID, updateLastSegment } from '@/utils/common';
import { print } from '@/utils/logger';
import {
  findProjectById,
  findProjectByTitle,
  findProjectByTitleAndPath,
} from '@/utils/projectHelpers';

function ProjectsView({ navigation }: RootScreenProps<Paths.ProjectsView>) {
  const { t } = useTranslation();

  const { fonts, gutters } = useTheme();

  const homeFolder = useAtomValue(HomeFolderStateAtom);
  const language = useAtomValue(LanguageStateAtom);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string>('');
  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        if (homeFolder.length > 0) {
          const permissionToHomeFolder = await hasPermission(homeFolder);
          if (!permissionToHomeFolder) {
            Toast.show({
              text1: t('components.folder_selector.permission_error.text1'),
              text2: t('components.folder_selector.permission_error.text2'),
              type: 'error',
            });
          } else {
            // List all files in "homeFolder" (selected by user)
            const __allExternalStorageFolders = await listFiles(homeFolder);
            // Remove everything that's not a directory and also hidden directories
            const allExternalStorageFolders =
              __allExternalStorageFolders.filter(
                (item) =>
                  item.type === 'directory' && !item.name.startsWith('.'),
              );

            // Check if these directories were already mapped before
            for (const project of allExternalStorageFolders) {
              // Check if it was mapped before on an Android device
              const persistedAndroidProjectContent = findProjectByTitleAndPath(
                allProjects,
                project.name,
                project.uri,
              );
              if (!persistedAndroidProjectContent) {
                // It wasn't mapped before on an Android device
                // Check if it was mapped before on any other device
                const persistedExternalProjectContent = findProjectByTitle(
                  allProjects,
                  project.name,
                );
                if (persistedExternalProjectContent) {
                  // It was mapped before on other device
                  setAllProjects((prevState) =>
                    prevState.map((salvedProject) =>
                      salvedProject.id === persistedExternalProjectContent.id
                        ? {
                            ...salvedProject,
                            androidFolderPath: project.uri,
                            lastUpdate: Date.now(),
                          }
                        : salvedProject,
                    ),
                  );
                } else {
                  // It wasn't mapped before on any other device
                  // Map the project for the first time
                  const __defineNewProject: Project = {
                    ...initialProjectContent,
                    androidFolderPath: project.uri,
                    id: createNewUUID(),
                    lastUpdate: project.lastModified,
                    title: project.name,
                  };
                  setAllProjects((prevState) => [
                    ...prevState,
                    __defineNewProject,
                  ]);
                }
              }
            }
          }
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
  }, [allProjects, homeFolder, language, loadingProjects, setAllProjects, t]);

  const onNavigate = (id: string) => {
    navigation.navigate(Paths.ChaptersView, { id });
  };

  // Change the exhibition title and the folder name
  const changeProjectTitle = (projectId: string, newTitle: string) => {
    const projectContent = findProjectById(allProjects, projectId);
    if (projectContent) {
      (async () => {
        try {
          const folderRenamed = await rename(
            projectContent.androidFolderPath,
            newTitle,
          );
          if (folderRenamed) {
            const newAndroidPath = updateLastSegment(
              projectContent.androidFolderPath,
              newTitle,
            );
            setAllProjects((prevState) =>
              prevState.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      androidFolderPath: newAndroidPath,
                      lastUpdate: Date.now(),
                      title: newTitle,
                    }
                  : project,
              ),
            );
            Toast.show({
              text1: t('screen_projects.folder_renamed.text1'),
              text2: t('screen_projects.folder_renamed.text2'),
              type: 'success',
            });
          } else {
            Toast.show({
              text1: t('screen_projects.folder_not_renamed.text1'),
              text2: t('screen_projects.folder_not_renamed.text2'),
              type: 'error',
            });
          }
        } catch (error) {
          print(error);
        }
      })();
    }
  };

  const changeProjectDescription = (
    projectId: string,
    newDescription: string,
  ) => {
    setAllProjects((prevState) =>
      prevState.map((project) =>
        project.id === projectId
          ? { ...project, blurb: newDescription, lastUpdate: Date.now() }
          : project,
      ),
    );
    Toast.show({
      text1: t('screen_projects.description_updated.text1'),
      text2: t('screen_projects.description_updated.text2'),
      type: 'success',
    });
  };

  const changeProjectImage = (projectId: string, imageUri: string) => {
    (async () => {
      try {
        const coverFolder = `.scriptura/covers`;
        await copyFile(
          imageUri,
          `${homeFolder}/${coverFolder}/${projectId}.png`,
          {
            replaceIfDestinationExists: true,
          },
        );
        setAllProjects((prevState) =>
          prevState.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  coverPath: `${coverFolder}/${projectId}.png`,
                  lastUpdate: Date.now(),
                }
              : project,
          ),
        );
        Toast.show({
          text1: t('screen_projects.image_changed.text1'),
          text2: t('screen_projects.image_changed.text2'),
          type: 'success',
        });
      } catch (error) {
        print(error);
      }
    })();
  };

  // changeLanguage(i18next.language === SupportedLanguages.EN_EN
  //   ? SupportedLanguages.PT_BR
  //   : SupportedLanguages.EN_EN,);

  return (
    <SafeScreen>
      <ScrollView>
        <View style={[gutters.paddingHorizontal_32]}>
          <View style={[gutters.marginTop_40]}>
            <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
              {t('screen_projects.title')}
            </Text>
          </View>
          <FolderSelector />
        </View>
        <View>
          <View style={[gutters.marginVertical_24]}>
            <TitleBar title={t('screen_projects.view')} />
          </View>
          <View style={[gutters.paddingHorizontal_32]}>
            {loadingProjects ? (
              <Text>Loading...</Text>
            ) : allProjects.length > 0 ? (
              allProjects.map((project: Project) => {
                return (
                  <ProjectCard
                    changeProjectDescription={changeProjectDescription}
                    changeProjectImage={changeProjectImage}
                    changeProjectTitle={changeProjectTitle}
                    description={project.blurb}
                    editingId={editingId}
                    id={project.id}
                    image={project.coverPath}
                    key={project.title}
                    onNavigate={onNavigate}
                    setEditingId={setEditingId}
                    title={project.title}
                  />
                );
              })
            ) : (
              <Text>{t('screen_projects.nothing_found')}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

export default ProjectsView;
