import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, Project } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { listFiles, readFile } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import { Paths } from '@/navigation/paths';

import ParallaxImage from '@/components/atoms/ParallaxImage/ParallaxImage';
import ChapterCard from '@/components/molecules/ChapterCard/ChapterCard';

import {
  LanguageStateAtom,
  ProjectsDataStateAtom,
} from '@/state/atoms/persistentContent';
import { ChapterStatusType } from '@/state/defaults';
import {
  countWordsFromHTML,
  findChapterByTitleAndPath,
  getProjectById,
  getTitleFromChapterFile,
} from '@/utils/chapterHelpers';
import { createNewUUID, formatTimestamp } from '@/utils/common';
import { print } from '@/utils/logger';

function ChaptersView({
  navigation,
  route,
}: RootScreenProps<Paths.ChaptersView>) {
  const { t } = useTranslation();
  const { id } = route.params;

  const language = useAtomValue(LanguageStateAtom);
  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<Project>();
  const [editingId, setEditingId] = useState<string>('');
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);

  const onNavigateBack = () => {
    navigation.navigate(Paths.ProjectsView);
  };

  const updateChaptersById = (id: string, newChapters: Chapter[]) => {
    setAllProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, chapters: newChapters } : project,
      ),
    );
  };

  const onNavigate = (id: string, chapterId: string) => {
    updateChaptersById(id, allChapters);
    navigation.navigate(Paths.ContentView, { chapterId, id });
  };

  useEffect(() => {
    const book = getProjectById(id, allProjects);
    setSelectedBook(book);
  }, [allProjects, id]);

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

            const __defineNewChapter: Chapter = savedChapter ? {
              ...savedChapter,
                wordCount: markdownWordCount,
              } : {
                androidFilePath: chapter.uri,
                id: createNewUUID(),
                iphoneFilePath: '',
                lastUpdate: formatTimestamp(chapter.lastModified, language),
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
  }, [id, language, selectedBook, setAllProjects, t]);

  return (
    <View>
      {selectedBook && (
        <ParallaxImage
          onNavigateBack={onNavigateBack}
          parallaxImage={PlaceholderImage}
          parallaxSubtitle={`${t('screen_chapters.updated_at')} ${selectedBook.lastUpdate}`}
          parallaxTitle={`${selectedBook.title}`}
        >
          <View>
            {loadingChapters ? (
              <Text>Loading...</Text>
            ) : allChapters.length > 0 ? (
              allChapters.map((chapter: Chapter) => {
                return (
                  <ChapterCard
                    editingId={editingId}
                    id={chapter.id}
                    key={chapter.id}
                    lastUpdate={chapter.lastUpdate}
                    lastViewedId={selectedBook.chapterLastViewed}
                    onNavigate={() => onNavigate(id, chapter.id)}
                    setEditingId={setEditingId}
                    status={chapter.status}
                    title={chapter.title}
                    wordCount={chapter.wordCount}
                  />
                );
              })
            ) : (
              <Text>{t('screen_chapters.no_chapters')}</Text>
            )}
          </View>
        </ParallaxImage>
      )}
    </View>
  );
}

export default ChaptersView;
