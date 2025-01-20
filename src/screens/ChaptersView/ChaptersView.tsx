import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, Project } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { listFiles, readFile } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import { Paths } from '@/navigation/paths';

import ParallaxImage from '@/components/atoms/ParallaxImage/ParallaxImage';

import {
  LanguageStateAtom,
  ProjectsDataStateAtom,
} from '@/state/atoms/persistentContent';
import { ChapterStatusType } from '@/state/defaults';
import {
  countWordsFromHTML,
  getBookById,
  getTitleFromChapterFile,
  markdownToHtml,
} from '@/utils/chapterHelpers';
import { createNewUUID, formatTimestamp } from '@/utils/common';
import { print } from '@/utils/logger';

function ChaptersView({
  navigation,
  route,
}: RootScreenProps<Paths.ChaptersView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();
  const language = useAtomValue(LanguageStateAtom);
  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<Project>();
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);

  const onNavigate = () => {
    navigation.navigate(Paths.ContentView);
  };

  const { id } = route.params;

  useEffect(() => {
    const book = getBookById(id, allProjects);
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
            const chapterFileContentTile: string =
              getTitleFromChapterFile(chapterFileContent) ??
              'No title. See help for instructions';

            const renderedMarkDown = markdownToHtml(chapterFileContent);
            const markdownWordCount = countWordsFromHTML(renderedMarkDown);

            const __defineNewChapter: Chapter = {
              androidFilePath: chapter.uri,
              id: createNewUUID(),
              iphoneFilePath: '',
              isLastViewed: false,
              lastUpdate: formatTimestamp(chapter.lastModified, language),
              linuxFilePath: '',
              osxFilePath: '',
              revisionPosition: -1,
              status: ChapterStatusType.Undefined,
              title: chapterFileContentTile,
              windowsFilePath: '',
              wordCount: markdownWordCount,
            };

            allChaptersData.push(__defineNewChapter);
          }
          setAllChapters(allChaptersData);
          console.log(allChaptersData);
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
  }, [language, selectedBook, t]);

  return (
    <View>
      <ParallaxImage
        parallaxImage={PlaceholderImage}
        parallaxSubtitle={`Last Updated at ${selectedBook?.lastUpdate}`}
        parallaxTitle={`${selectedBook?.title}`}
      >
        <View style={{ backgroundColor: '#fff', height: 2000 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            Parallax Scroll
          </Text>
        </View>
      </ParallaxImage>
    </View>
  );
}

export default ChaptersView;
