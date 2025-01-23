import type { RootScreenProps } from '@/navigation/types';
import type { Chapter } from '@/state/defaults';

import { useAtom } from 'jotai/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { readFile } from 'react-native-saf-x';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import StatisticsBar from '@/components/atoms/StatisticsBar/StatisticsBar';
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

  const [viewMode, setViewMode] = useState<boolean>(true);
  const [chapterTitle, setChapterTitle] = useState<string>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const [markdownText, setMarkdownText] = useState<string>('');

  const onNavigateBack = () => {
    navigation.navigate(Paths.ChaptersView, { id });
  };

  const onNavigateToStatistics = () => {
    Alert.alert('onNavigateToStatistics');
  };

  const onToggleView = () => {
    setViewMode(!viewMode);
  };

  const styles = StyleSheet.create({
    markdownContent: {
      backgroundColor: colors.gray50 + '5F',
      marginBottom: 64,
    },
    markdownContentEdit: {
      backgroundColor: colors.full,
      marginBottom: 32,
    },
  });

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
        const markdownTextContent: string = await readFile(
          selectedChapter.androidFilePath,
        );
        setMarkdownText(markdownTextContent);
      };
      void fetchFileContent();
    }
  }, [selectedChapter]);

  return (
    <View style={layout.flex_1}>
      {selectedChapter && (
        <View style={layout.flex_1}>
          <TitleBar
            onNavigateBack={onNavigateBack}
            onToggleView={onToggleView}
            title={chapterTitle ?? t('screen_content.view')}
            viewMode={viewMode}
          />
          <ScrollView style={viewMode ? styles.markdownContent : styles.markdownContentEdit}>
            <View
              style={[
                gutters.paddingHorizontal_8,
                gutters.marginHorizontal_8,
                gutters.marginTop_4,
                gutters.marginBottom_12,
                gutters.paddingVertical_4,
              ]}
            >
              {viewMode ? (
                <MarkdownRenderer markdown={markdownText} />
              ) : (
                <Text>{markdownText}</Text>
              )}
            </View>
          </ScrollView>
          <StatisticsBar
            onNavigateToStatistics={onNavigateToStatistics}
            viewMode={viewMode}
            wordCount={selectedChapter.wordCount}
            wordGoal={1000}
            wordsWrittenToday={357}
          />
        </View>
      )}
    </View>
  );
}

export default ContentView;
