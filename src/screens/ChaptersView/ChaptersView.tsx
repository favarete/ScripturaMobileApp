import type { ImageURISource } from 'react-native';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, Project } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { hasPermission, listFiles, readFile } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import { Paths } from '@/navigation/paths';

import { ChaptersDynamicList } from '@/components/organisms/ChaptersDynamicList/ChaptersDynamicList';

import {
  HomeFolderStateAtom,
  LanguageStateAtom,
  ProjectsDataStateAtom,
} from '@/state/atoms/persistentContent';
import { ChapterStatusType, getValidChapterEnum } from '@/state/defaults';
import {
  countWordsFromHTML,
  findChapterByTitleAndPath,
  getProjectById,
  getTitleFromChapterFile,
  updateChapterValue,
} from '@/utils/chapterHelpers';
import { createNewUUID, formatTimestamp } from '@/utils/common';
import { print } from '@/utils/logger';
import { findProjectById } from '@/utils/projectHelpers';

function ChaptersView({
  navigation,
  route,
}: RootScreenProps<Paths.ChaptersView>) {
  const { t } = useTranslation();
  const { projectId } = route.params;
  const { gutters } = useTheme();

  const language = useAtomValue(LanguageStateAtom);
  const homeFolder = useAtomValue(HomeFolderStateAtom);

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<Project>();
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [allChaptersSorted, setAllChaptersSorted] = useState<Chapter[]>([]);
  const [imageToLoad, setImageToLoad] =
    useState<ImageURISource>(PlaceholderImage);

  const onNavigateBack = () => {
    updateChaptersById(projectId, allChapters);
    navigation.navigate(Paths.ProjectsView);
  };

  const updateChaptersById = (id: string, newChapters: Chapter[]) => {
    setAllProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, chapters: newChapters } : project,
      ),
    );
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

  const onNavigate = (projectId: string, chapterId: string) => {
    updateChaptersById(projectId, allChapters);
    navigation.navigate(Paths.ContentView, { chapterId, projectId });
  };

  useEffect(() => {
    const book: Project | undefined = getProjectById(projectId, allProjects);
    if (book) {
      (async () => {
        try {
          const imageURI = `${homeFolder}/.scriptura/covers/${book.coverPath}`;
          const __hasPermission = await hasPermission(imageURI);
          if (__hasPermission) {
            const base64String = await readFile(imageURI, {
              encoding: 'base64',
            });

            setImageToLoad({ uri: `data:image/png;base64,${base64String}` });
          }
        } catch (error) {
          print(error);
        }
      })();
      setSelectedBook(book);
    }
  }, [allProjects, homeFolder, projectId]);

  useEffect(() => {
    if (selectedBook) {
      const fetchAllChapters = async () => {
        try {
          // Get all markdown files directly inside the project's directory
          // TODO: Probably it's better if this function search recursively for any markdown in any nested directory
          const __allExternalStorageProjectFiles = await listFiles(
            selectedBook.androidFolderPath,
          );

          // Remove everything that's not a markdown
          const allExternalStorageProjectFiles =
            __allExternalStorageProjectFiles.filter(
              (item) => item.mime === 'text/markdown',
            );

          // Get Data from all chapters
          const allChaptersData: Chapter[] = [];
          for (const chapter of allExternalStorageProjectFiles) {
            const chapterFileContent: string = await readFile(chapter.uri);
            const chapterFileContentTitle: string =
              getTitleFromChapterFile(chapterFileContent) ??
              t('screen_chapters.no_title');

            const markdownWordCount = countWordsFromHTML(chapterFileContent);

            const savedChapter = findChapterByTitleAndPath(
              selectedBook.chapters,
              chapterFileContentTitle,
              chapter.uri,
            );

            const __defineNewChapter: Chapter = savedChapter
              ? {
                  ...savedChapter,
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
                  title: chapterFileContentTitle,
                  windowsFilePath: '',
                  wordCount: markdownWordCount,
                };
            allChaptersData.push(__defineNewChapter);
          }

          // const TestData: Chapter[] = [];
          // for (let i = 0; i < 15; i++) {
          //   TestData.push({
          //     androidFilePath: `android/path/to/file/${i}`,
          //     id: createNewUUID(),
          //     iphoneFilePath: `iphone/path/to/file/${i}`,
          //     lastUpdate: 1_000_000, // Random date within ~115 days
          //     linuxFilePath: `linux/path/to/file/${i}`,
          //     osxFilePath: `osx/path/to/file/${i}`,
          //     revisionPosition: -1,
          //     status: ChapterStatusType.Undefined,
          //     title: `Chapter ${i + 1}: Random Title ${createNewUUID().slice(0, 4)}`,
          //     windowsFilePath: `windows/path/to/file/${i}`,
          //     wordCount: 1000,
          //   });
          // }
          setAllChapters(allChaptersData);
        } catch (error) {
          Toast.show({
            text1: t('unknown_error.text1'),
            text2: t('unknown_error.text2'),
            type: 'error',
          });
          print(error);
        } finally {
          setLoadingChapters(false);
        }
      };
      void fetchAllChapters();
    }
  }, [selectedBook, t]);

  useEffect(() => {
    const selectedProject = findProjectById(allProjects, projectId);
    if (selectedProject) {
      let chapterSort = selectedProject.chapterSort;
      if (chapterSort.length === 0) {
        chapterSort = allChapters.map((chapter) => chapter.id);
      }
      const orderMap = new Map(chapterSort.map((id, index) => [id, index]));
      const sortedArray = [...allChapters].sort((a, b) => {
        return (
          (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
        );
      });
      setAllChaptersSorted(sortedArray);
    }
  }, [allChapters, allProjects, projectId]);

  const projectUpdatedOn = selectedBook
    ? formatTimestamp(selectedBook.lastUpdate, language)
    : '';

  return (
    <View>
      {selectedBook && (
        <View style={[gutters.marginTop_16]}>
          {loadingChapters ? (
            <Text>Loading...</Text>
          ) : allChapters.length > 0 ? (
            <ChaptersDynamicList
              onNavigateBack={onNavigateBack}
              setAllChaptersSorted={setAllChaptersSorted}
              selectedBook={selectedBook}
              allChaptersSorted={allChaptersSorted}
              onNavigate={onNavigate}
              updateChaptersStatus={updateChaptersStatus}
              projectId={projectId}
              parallaxImage={imageToLoad}
              parallaxSubtitle={`${t('screen_chapters.updated_at')} ${projectUpdatedOn}`}
              parallaxTitle={`${selectedBook.title}`}
            />
          ) : (
            <Text>{t('screen_chapters.no_chapters')}</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default ChaptersView;
