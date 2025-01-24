import type { MarkdownStyle } from '@expensify/react-native-live-markdown';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter } from '@/state/defaults';

import {
  MarkdownTextInput,
  parseExpensiMark,
} from '@expensify/react-native-live-markdown';
import { useAtom } from 'jotai/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { readFile, writeFile } from 'react-native-saf-x';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import StatisticsBar from '@/components/atoms/StatisticsBar/StatisticsBar';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer/MarkdownRenderer';

import { ProjectsDataStateAtom } from '@/state/atoms/persistentContent';
import { countWordsFromHTML, getChapterById, getTitleFromChapterFile, updateChapterValue } from '@/utils/chapterHelpers';

function ContentView({
  navigation,
  route,
}: RootScreenProps<Paths.ContentView>) {
  const { t } = useTranslation();

  const { colors, fonts, gutters, layout } = useTheme();
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

  const onSave = () => {
    if (selectedChapter) {
      const saveFileContent = async () => {
        try {
          await writeFile(selectedChapter.androidFilePath, markdownText);

          updateChapterValue(
            setAllProjects,
            id,
            chapterId,
            {
              title: getTitleFromChapterFile(markdownText) ??
                'No title. See help for instructions',
              wordCount: countWordsFromHTML(markdownText),
            }
          )
        } catch (error) {
          console.error(error);
        }
      };
      void saveFileContent();
    }
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

  const markdownEditStyles = {
    ...fonts.size_16,
    lineHeight: 24,
    ...fonts.defaultFontFamilyRegular,
    ...gutters.marginBottom_12,
  };

  const markdownStylesEdit: MarkdownStyle = {
    blockquote: {
      borderColor: colors.purple500,
    },
    code: {
      backgroundColor: colors.fullOpposite + '1A',
      ...gutters.padding_12,
      ...Platform.select({
        ['android']: {
          fontFamily: 'monospace',
        },
        ['ios']: {
          fontFamily: 'Courier New',
        },
      }),
    },
    emoji: {
      ...fonts.size_24,
    },
    h1: {
      ...fonts.size_24,
    },
    link: {
      color: colors.purple500,
    },
    mentionHere: {
      backgroundColor: colors.gray100,
      color: colors.purple500,
    },
    mentionUser: {
      backgroundColor: colors.gray100,
      color: colors.green500,
    },
    pre: {
      backgroundColor: colors.fullOpposite + '1A',
      ...gutters.padding_12,
      ...Platform.select({
        ['android']: {
          fontFamily: 'monospace',
        },
        ['ios']: {
          fontFamily: 'Courier New',
        },
      }),
    },
  };

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
          <ScrollView
            style={
              viewMode ? styles.markdownContent : styles.markdownContentEdit
            }
          >
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
                <MarkdownTextInput
                  autoCapitalize="none"
                  autoFocus
                  markdownStyle={markdownStylesEdit}
                  maxLength={30_000}
                  multiline
                  onChangeText={setMarkdownText}
                  parser={parseExpensiMark}
                  style={[markdownEditStyles]}
                  value={markdownText}
                />
              )}
            </View>
          </ScrollView>
          <StatisticsBar
            onNavigateToStatistics={onNavigateToStatistics}
            onSave={onSave}
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
