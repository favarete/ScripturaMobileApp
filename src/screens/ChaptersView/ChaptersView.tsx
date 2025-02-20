import type { ImageURISource } from 'react-native';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, Project } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai/index';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { hasPermission, listFiles, readFile } from 'react-native-saf-x';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import { Paths } from '@/navigation/paths';

import { ChaptersDynamicList } from '@/components/organisms/ChaptersDynamicList/ChaptersDynamicList';

import {
  HomeFolderStateAtom,
  LanguageStateAtom,
  ProjectsDataStateAtom,
  SaveAtomEffect,
} from '@/state/atoms/persistentContent';
import { ChapterStatusType, getValidChapterEnum } from '@/state/defaults';
import {
  countWordsFromHTML,
  findChapterByTitleAndPath,
  getProjectById,
  updateChapterValue,
} from '@/utils/chapterHelpers';
import {
  arraysAreEqualAndNonEmpty,
  createNewUUID,
  formatTimestamp,
  removeFileExtension,
} from '@/utils/common';
import { print } from '@/utils/logger';
import { findProjectById } from '@/utils/projectHelpers';
import { useFocusEffect } from '@react-navigation/native';

function ChaptersView({
  navigation,
  route,
}: RootScreenProps<Paths.ChaptersView>) {
  useAtom(SaveAtomEffect);

  const { t } = useTranslation();
  const { projectId } = route.params;
  const { gutters } = useTheme();

  const language = useAtomValue(LanguageStateAtom);
  const homeFolder = useAtomValue(HomeFolderStateAtom);

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);
  const [allChaptersSorted, setAllChaptersSorted] = useState<Chapter[]>([]);
  const [imageToLoad, setImageToLoad] =
    useState<ImageURISource>(PlaceholderImage);

  const [lastChapterViewed, setLastChapterViewed] = useState<string>('');
  const [projectWordCount, setProjectWordCount] = useState<number>(0);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectUpdatedOn, setProjectUpdatedOn] = useState<string>('');

  const updateChaptersById = (id: string, newChapters: Chapter[]) => {
    setAllProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, chapters: newChapters } : project,
      ),
    );
  };

  const onNavigateBack = () => {
    updateChaptersById(projectId, allChaptersSorted);
    navigation.navigate(Paths.ProjectsView);
  };

  const onNavigate = (projectId: string, chapterId: string) => {
    updateChaptersById(projectId, allChaptersSorted);
    navigation.navigate(Paths.ContentView, { chapterId, projectId });
  };

  const updateChaptersStatus = (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => {
    const validEnum = getValidChapterEnum(newStatus);
    updateChapterValue(setAllProjects, projectId, chapterId, {
      status: validEnum,
    });
  };

  useFocusEffect(
    useCallback(() => {
      const selectedProject: Project | undefined = getProjectById(
        projectId,
        allProjects,
      );
      console.log('-------------')
      console.log(selectedProject)
      if (selectedProject) {
        (async () => {
          try {
            const imageURI = `${homeFolder}/.scriptura/covers/${selectedProject.coverPath}`;
            const __hasPermission = await hasPermission(imageURI);
            if (__hasPermission) {
              const base64String = await readFile(imageURI, {
                encoding: 'base64',
              });
              if (base64String.trim().length > 0) {
                setImageToLoad({ uri: `data:image/png;base64,${base64String}` });
              }
            }
            const __allExternalStorageProjectFiles = await listFiles(
              selectedProject.androidFolderPath,
            );
            // Remove everything that's not a markdown
            const allExternalStorageProjectFiles =
              __allExternalStorageProjectFiles.filter(
                (item) => item.mime === 'text/markdown',
              );
            // Get Data from all chapters
            const allChaptersData: Chapter[] = [];
            let totalWordCount = 0;
            let latestUpdateInProject = 0;
            let latestUpdateInProjectId = '';
            for (const chapter of allExternalStorageProjectFiles) {
              const chapterFileContent: string = await readFile(chapter.uri);
              const chapterFileTitle: string =
                removeFileExtension(chapter.name) ??
                t('screen_chapters.no_title');

              const markdownWordCount = countWordsFromHTML(chapterFileContent);

              const savedChapter = findChapterByTitleAndPath(
                selectedProject.chapters,
                chapterFileTitle,
                chapter.uri,
              );

              const __defineNewChapter: Chapter = savedChapter
                ? {
                  ...savedChapter,
                  lastUpdate: chapter.lastModified,
                  wordCount: markdownWordCount,
                }
                : {
                  androidFilePath: chapter.uri,
                  id: createNewUUID(),
                  iphoneFilePath: '',
                  lastUpdate: chapter.lastModified,
                  linuxFilePath: '',
                  osxFilePath: '',
                  revisionPosition: -1,
                  status: ChapterStatusType.Undefined,
                  title: chapterFileTitle,
                  windowsFilePath: '',
                  wordCount: markdownWordCount,
                };
              totalWordCount += markdownWordCount;
              if (__defineNewChapter.lastUpdate > latestUpdateInProject) {
                latestUpdateInProject = __defineNewChapter.lastUpdate;
                latestUpdateInProjectId = __defineNewChapter.id;
              }
              allChaptersData.push(__defineNewChapter);
            }
            setAllProjects((prevProjects) =>
              prevProjects.map((project) =>
                project.id === projectId
                  ? {
                    ...project,
                    chapters: allChaptersData,
                    chapterLastViewed: latestUpdateInProjectId,
                    lastUpdate: latestUpdateInProject,
                    wordCount: totalWordCount,
                  }
                  : project,
              ),
            );
            setLastChapterViewed(latestUpdateInProjectId)
            setProjectWordCount(totalWordCount)
            setProjectTitle(selectedProject.title)
            setProjectUpdatedOn(formatTimestamp(latestUpdateInProject, language))
          } catch (error) {
            print(error);
          }
        })();
      }
    }, [])
  );

  useEffect(() => {
    if (allChaptersSorted.length > 0) {
      const orderedIds = allChaptersSorted.map((chapter) => chapter.id);
      const actualProject = findProjectById(allProjects, projectId);
      if (actualProject) {
        const alreadyUpdated = arraysAreEqualAndNonEmpty(
          actualProject.chapterSort,
          orderedIds,
        );
        if (!alreadyUpdated) {
          setAllProjects((prevProjects) =>
            prevProjects.map((project) =>
              project.id === projectId
                ? { ...project, chapterSort: orderedIds }
                : project,
            ),
          );
        }
      }
    }
  }, [allChaptersSorted]);

  useEffect(() => {
    const selectedProject = findProjectById(allProjects, projectId);
    if (selectedProject) {
      const updatedChapters = selectedProject.chapters;

      let chapterSort = selectedProject.chapterSort;
      if (chapterSort.length === 0) {
        chapterSort = updatedChapters.map((chapter) => chapter.id);
      }

      const orderMap = new Map(chapterSort.map((id, index) => [id, index]));
      const sortedArray = [...updatedChapters].sort((a, b) => {
        return (
          (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
        );
      });
      setAllChaptersSorted(sortedArray);
      setLoadingChapters(false);
    }
  }, [allProjects, projectId]);

  return (
    <View style={[gutters.marginTop_16]}>
      {loadingChapters ? (
        <Text>Loading...</Text>
      ) : allChaptersSorted.length > 0 ? (
        <ChaptersDynamicList
          allChaptersSorted={allChaptersSorted}
          onNavigate={onNavigate}
          onNavigateBack={onNavigateBack}
          parallaxImage={imageToLoad}
          parallaxSubtitle={`${t('screen_chapters.updated_at')} ${projectUpdatedOn}`}
          parallaxTitle={projectTitle}
          projectId={projectId}
          projectWordCount={projectWordCount}
          lastChapterViewed={lastChapterViewed}
          setAllChaptersSorted={setAllChaptersSorted}
          updateChaptersStatus={updateChaptersStatus}
        />
      ) : (
        <Text>{t('screen_chapters.no_chapters')}</Text>
      )}
    </View>
  );
}

export default ChaptersView;
