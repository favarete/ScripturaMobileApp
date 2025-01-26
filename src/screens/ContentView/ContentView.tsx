import type { MarkdownStyle } from '@expensify/react-native-live-markdown';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter } from '@/state/defaults';

import {
  MarkdownTextInput,
  parseExpensiMark,
} from '@expensify/react-native-live-markdown';
import { useAtomValue } from 'jotai/index';
import { useAtom } from 'jotai/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { readFile, writeFile } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import StatisticsBar from '@/components/atoms/StatisticsBar/StatisticsBar';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer/MarkdownRenderer';

import {
  AutosaveModeStateAtom,
  ProjectsDataStateAtom,
  SaveAtomEffect,
} from '@/state/atoms/persistentContent';
import {
  countWordsFromHTML,
  getChapterById,
  getTitleFromChapterFile,
  updateChapterValue,
} from '@/utils/chapterHelpers';
import { print } from '@/utils/logger';

function ContentView({
  navigation,
  route,
}: RootScreenProps<Paths.ContentView>) {
  useAtom(SaveAtomEffect);
  const { t } = useTranslation();

  const { colors, fonts, gutters, layout } = useTheme();
  const { chapterId, id } = route.params;

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const autosaveMode = useAtomValue(AutosaveModeStateAtom);

  const [viewMode, setViewMode] = useState<boolean>(true);
  const [chapterTitle, setChapterTitle] = useState<string>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const [markdownText, setMarkdownText] = useState<string>('');

  const [contentCount, setContentCount] = useState<number>(0);

  const onSave = useCallback(() => {
    if (selectedChapter) {
      const saveFileContent = async () => {
        try {
          await writeFile(selectedChapter.androidFilePath, markdownText);
          updateChapterValue(setAllProjects, id, chapterId, {
            title:
              getTitleFromChapterFile(markdownText) ??
              t('screen_chapters.no_title'),
            wordCount: countWordsFromHTML(markdownText),
          });
        } catch (error) {
          Toast.show({
            text1: t('saving_error.text1'),
            text2: t('saving_error.text2'),
            type: 'error',
          });
          print(error);
        }
      };
      void saveFileContent();
    }
  }, [
    selectedChapter,
    markdownText,
    setAllProjects,
    id,
    chapterId,
    t,
  ]);

  const onNavigateBack = () => {
    onSave();
    navigation.navigate(Paths.ChaptersView, { id });
  };

  const onNavigateToStatistics = () => {
    Alert.alert('onNavigateToStatistics');
  };

  useEffect(() => {
    if (contentCount > 0 && contentCount % 5 === 0) {
      onSave();
    }
  }, [chapterId, contentCount, id, markdownText, onSave, selectedChapter, setAllProjects, t]);

  useEffect(() => {
    setContentCount(0);
  }, [markdownText]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autosaveMode && !viewMode) {
        setContentCount((prevState) => prevState + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [autosaveMode, viewMode]);

  const onToggleView = () => {
    onSave();
    setContentCount(0);
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
            <Text>{contentCount}</Text>
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
