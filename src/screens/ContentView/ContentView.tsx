import type { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter } from '@/state/defaults';

import { useAtom } from 'jotai/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { readFile } from 'react-native-saf-x';

import { useTheme } from '@/theme';

import { TitleBar } from '@/components/atoms';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer/MarkdownRenderer';

import { ProjectsDataStateAtom } from '@/state/atoms/persistentContent';
import { getChapterById } from '@/utils/chapterHelpers';

function ContentView({
  navigation,
  route,
}: RootScreenProps<Paths.ContentView>) {
  const { t } = useTranslation();

  const { colors, components, fonts, gutters, layout } = useTheme();
  const { chapterId, id } = route.params;

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [chapterTitle, setChapterTitle] = useState<string>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const [markdownText, setMarkdownText] = useState<string>('');

  useEffect(() => {
    const chapter = getChapterById(id, chapterId, allProjects);
    if (chapter) {
      setSelectedChapter(chapter);
    }
  }, [allProjects, chapterId, id]);

  useEffect(() => {
    if (selectedChapter) {
      setChapterTitle(selectedChapter.title);

      const fetchFileContent = async () => {
        const markdownTextContent: string = await readFile(selectedChapter.androidFilePath);
        setMarkdownText(markdownTextContent)
      };
      void fetchFileContent();
    }
  }, [selectedChapter]);

  return (
    <ScrollView>
      <TitleBar title={chapterTitle ?? t('screen_content.view')} />
      <View style={[gutters.paddingVertical_12]}>
        <MarkdownRenderer markdown={markdownText} />
      </View>
    </ScrollView>
  );
}

export default ContentView;
