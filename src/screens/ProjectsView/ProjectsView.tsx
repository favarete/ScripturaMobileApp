import type { FC } from 'react';
import type { FlatList, ListRenderItemInfo } from 'react-native';
import type { ReorderableListReorderEvent } from 'react-native-reorderable-list';
import type { RootScreenProps } from '@/navigation/types';
import type { Project } from '@/state/defaults';

import { useIsFocused } from '@react-navigation/native';
import { useAtom, useAtomValue } from 'jotai';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import ReorderableList, {
  reorderItems,
  useIsActive,
  useReorderableDrag,
} from 'react-native-reorderable-list';
import {
  copyFile,
  createFile,
  hasPermission,
  listFiles,
  mkdir,
  rename,
} from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import useKeyboardShortcuts from '@/hooks/keyboard/useKeyboardShortcuts';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import BounceLoader from '@/components/atoms/BounceLoader/BounceLoader';
import MainHeader from '@/components/atoms/MainHeader/MainHeader';
import { FolderSelector } from '@/components/molecules';
import Averages from '@/components/molecules/Averages/Averages';
import ContentCreator from '@/components/molecules/ContentCreator/ContentCreator';
import ProjectCard from '@/components/molecules/ProjectCard/ProjectCard';

import {
  DailyWordsStatsStateAtom,
  HomeFolderStateAtom,
  LanguageStateAtom,
  ProjectsDataStateAtom,
  ProjectsSortStateAtom,
  SaveAtomEffect,
  UsageStatsStateAtom,
} from '@/state/atoms/persistentContent';
import { IsPortraitStateAtom, ItemEditStateAtom } from '@/state/atoms/temporaryContent';
import { initialProjectContent } from '@/state/defaults';
import { createNewUUID, updateLastSegment } from '@/utils/common';
import { print } from '@/utils/logger';
import {
  calculateUsageStats,
  findProjectById,
  findProjectByTitle,
  findProjectByTitleAndPath,
  getSupportFile,
  projectListsAreEqual,
} from '@/utils/projectHelpers';

function ProjectsView({ navigation }: RootScreenProps<Paths.ProjectsView>) {
  useAtom(SaveAtomEffect);

  const { t } = useTranslation();
  const { colors, fonts, gutters, layout } = useTheme();

  const homeFolder = useAtomValue(HomeFolderStateAtom);
  const language = useAtomValue(LanguageStateAtom);
  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [allProjectsSort, setAllProjectsSort] = useAtom(ProjectsSortStateAtom);
  const dailyWordsStats = useAtomValue(DailyWordsStatsStateAtom);

  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const editingItem = useAtomValue(ItemEditStateAtom);

  const [usageStats, setUsageStats] = useAtom(UsageStatsStateAtom);

  useEffect(() => {
    if (dailyWordsStats.length > 0) {
      setUsageStats(calculateUsageStats(dailyWordsStats));
    }
  }, [dailyWordsStats]);

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
            let allProjectsTemp: Project[] = await getSupportFile(homeFolder);
            const alreadyLoadedProjects = projectListsAreEqual(
              allProjectsTemp,
              allProjects,
            );

            if (!alreadyLoadedProjects || loadingProjects) {
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
                const persistedAndroidProjectContent =
                  findProjectByTitleAndPath(
                    allProjectsTemp,
                    project.name,
                    project.uri,
                  );

                if (!persistedAndroidProjectContent) {
                  // It wasn't mapped before on an Android device
                  // Check if it was mapped before on any other device
                  const persistedExternalProjectContent = findProjectByTitle(
                    allProjectsTemp,
                    project.name,
                  );

                  if (persistedExternalProjectContent) {
                    // It was mapped before on another device
                    allProjectsTemp = allProjectsTemp.map((savedProject) =>
                      savedProject.id === persistedExternalProjectContent.id
                        ? {
                            ...savedProject,
                            androidFolderPath: project.uri,
                            lastUpdate: Date.now(),
                          }
                        : savedProject,
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
                    allProjectsTemp = [...allProjectsTemp, __defineNewProject];
                  }
                }
              }
              let projectsSort = [...allProjectsSort];
              projectsSort = projectsSort.filter(
                (item): item is string => item != null,
              );
              if (projectsSort.length === 0) {
                projectsSort = allProjectsTemp.map((project) => project.id);
                setAllProjectsSort(projectsSort);
              } else if (projectsSort.length !== allProjectsTemp.length) {
                const setA = new Set(projectsSort);
                const zllIds = allProjectsTemp.map((project) => project.id);

                const uniqueItemsFromB = zllIds.filter(
                  (item) => !setA.has(item),
                );
                projectsSort = [...new Set([...uniqueItemsFromB, ...zllIds])];
                setAllProjectsSort(projectsSort);
              }
              const orderMap = new Map(
                projectsSort.map((id, index) => [id, index]),
              );
              const sortedArray = [...allProjectsTemp].sort((a, b) => {
                return (
                  (orderMap.get(a.id) ?? Infinity) -
                  (orderMap.get(b.id) ?? Infinity)
                );
              });
              setAllProjects(sortedArray);
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

  const onNavigate = (projectId: string) => {
    if (editingItem.id === '') {
      navigation.navigate(Paths.ChaptersView, { projectId });
    }
  };

  const onNavigateSettings = () => {
    navigation.navigate(Paths.SettingsView, { chapterId: '', projectId: '' });
  };

  const isFocused = useIsFocused();

  useKeyboardShortcuts({
    ctrlTimeout: 300,
    enabled: isFocused,
    letters: {
      S: () => onNavigateSettings(),
    },
    onSequence: (seq) => {
      if (editingItem.id === '') {
        const parsedNumber = Number(seq);
        if (Number.isInteger(parsedNumber)) {
          if (parsedNumber > 0 && parsedNumber <= allProjectsSort.length) {
            onNavigate(allProjectsSort[parsedNumber - 1]);
          }
        }
      }
    },
  });

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
                  coverPath: `${projectId}.png`,
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

  const createFolder = async (projectName: string) => {
    const newProject = `${homeFolder}/${projectName}`;
    try {
      await mkdir(newProject);
      const projectsFile = `${newProject}/${t('screen_projects.chapter_default')}.md`;
      await createFile(projectsFile);
      setLoadingProjects(true);
      Toast.show({
        text1: t('creating_folder_success.text1'),
        text2: t('creating_folder_success.text2'),
        type: 'success',
      });
    } catch (error) {
      Toast.show({
        text1: t('creating_folder_error.text1'),
        text2: t('creating_folder_error.text2'),
        type: 'error',
      });
      print(error);
    }
  };

  const ProjectCardInstance: FC<Project> = memo(
    ({ blurb, coverPath, id, title }) => {
      const drag = useReorderableDrag();
      const isActive = useIsActive();
      const [zIndex, setZIndex] = useState({
        opacity: 1,
        zIndex: -20,
      });

      useEffect(() => {
        if (
          editingItem.screen === 'projects-view' &&
          editingItem.id.length !== 0
        ) {
          if (editingItem.id === id) {
            setZIndex({
              opacity: 1,
              zIndex: -99_999,
            });
          } else {
            setZIndex({
              opacity: 0.25,
              zIndex: -99_999,
            });
          }
        } else {
          setZIndex({
            opacity: 1,
            zIndex: -99_999,
          });
        }
      }, [editingItem]);

      return (
        <View style={[gutters.paddingHorizontal_24, zIndex, !isPortrait && gutters.marginHorizontal_160]}>
          <ProjectCard
            changeProjectDescription={changeProjectDescription}
            changeProjectImage={changeProjectImage}
            changeProjectTitle={changeProjectTitle}
            description={blurb}
            drag={drag}
            id={id}
            image={coverPath}
            isActive={isActive}
            key={title}
            onNavigate={onNavigate}
            title={title}
            triggerUpdate={setLoadingProjects}
          />
        </View>
      );
    },
  );

  const renderItem = ({ item }: ListRenderItemInfo<Project>) => (
    <ProjectCardInstance {...item} />
  );

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    setAllProjectsSort((value) => reorderItems(value, from, to));
    setLoadingProjects(true)
  };
  const listRef = useRef<FlatList<Project>>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const isPortrait = useAtomValue(IsPortraitStateAtom);

  return (
    <View>
      {loadingProjects ? (
        <View
          style={[
            layout.itemsCenter,
            layout.fullHeight
          ]}
        >
          <BounceLoader
            animationDuration={800}
            bounceHeight={20}
            color={colors.gray800}
            dotCount={3}
            size={14}
            staggerDelay={200}
          />
        </View>
      ) : (
        <ReorderableList
          data={allProjects}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <View
              style={[
                layout.itemsCenter,
                layout.fullWidth,
                gutters.marginTop_4,
                {
                  zIndex: -999,
                },
              ]}
            >
              {!loadingProjects && (
                <ContentCreator
                  createContent={createFolder}
                  subtitle={t('screen_projects.folder_name')}
                  title={t('screen_projects.create_folder')}
                />
              )}
            </View>
          }
          ListHeaderComponent={
            <View>
              <View style={[gutters.paddingHorizontal_32]}>
                <View style={[gutters.marginTop_40, !isPortrait && gutters.marginHorizontal_160]}>
                  <Text
                    style={[
                      fonts.size_24,
                      fonts.gray400,
                      fonts.defaultFontFamilyBold,
                    ]}
                  >
                    {t('screen_projects.title')}
                  </Text>
                </View>
              </View>
              <MainHeader
                currentStreak={usageStats.currentStreak}
                maxStreak={usageStats.writingStreak}
                onNavigateSettings={onNavigateSettings}
              />
              <View style={[gutters.paddingHorizontal_32, !isPortrait && gutters.marginHorizontal_160]}>
                <FolderSelector />
              </View>
              <Averages
                daily={usageStats.averagePerDay}
                monthly={usageStats.averagePerMonth}
                weekly={usageStats.averagePerWeek}
              />
              <View style={[gutters.marginVertical_24]}>
                <TitleBar title={t('screen_projects.view')} />
              </View>
              {allProjects.length === 0 && (
                <View
                  style={[
                    layout.flex_1,
                    layout.itemsCenter,
                    gutters.marginTop_4,
                    gutters.marginVertical_20,
                    !isPortrait && gutters.marginHorizontal_160
                  ]}
                >
                  <Text
                    style={[
                      fonts.size_20,
                      fonts.gray400,
                      fonts.defaultFontFamilyBold,
                    ]}
                  >
                    {t('screen_projects.nothing_found')}
                  </Text>
                </View>
              )}
            </View>
          }
          onReorder={handleReorder}
          onScroll={scrollHandler}
          ref={listRef}
          renderItem={renderItem}
          shouldUpdateActiveItem
        />
      )}
    </View>
  );
}

export default ProjectsView;
