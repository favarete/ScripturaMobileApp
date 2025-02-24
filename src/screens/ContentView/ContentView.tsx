import type { MarkdownStyle } from '@expensify/react-native-live-markdown';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, DailyStats, Project } from '@/state/defaults';

import {
  MarkdownTextInput,
  parseExpensiMark,
} from '@expensify/react-native-live-markdown';
import { useFocusEffect } from '@react-navigation/native';
import { useAtomValue } from 'jotai/index';
import { useAtom } from 'jotai/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData} from 'react-native';
import {
  Keyboard,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
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
  WritingStatsStateAtom,
} from '@/state/atoms/persistentContent';
import {
  countWordsFromHTML,
  getChapterById,
  getProjectById,
} from '@/utils/chapterHelpers';
import {
  compareWordFrequencies,
  countOccurrences,
  getDateOnlyFromTimestamp,
  getWeekdayKey,
  minimizeMarkdownText,
  minimizeMarkdownTextLength,
} from '@/utils/common';
import { print } from '@/utils/logger';

const { KeyboardModule } = NativeModules;

function ContentView({
  navigation,
  route,
}: RootScreenProps<Paths.ContentView>) {
  useAtom(SaveAtomEffect);
  const { t } = useTranslation();

  const { colors, fonts, gutters, layout } = useTheme();
  const { chapterId, projectId } = route.params;

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);

  const autosaveMode = useAtomValue(AutosaveModeStateAtom);

  const [viewMode, setViewMode] = useState<boolean>(true);
  const [isPhysicalKeyboard, setIsPhysicalKeyboard] = useState<boolean>(false);

  const [chapterTitle, setChapterTitle] = useState<string>(
    t('screen_chapters.no_title'),
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();

  const dayRef = useRef<number>(getDateOnlyFromTimestamp(Date.now()));
  const [localCountOccurrences, setLocalCountOccurrences] = useState<
    Record<string, number>
  >({});

  const [markdownText, setMarkdownText] = useState<string>('');

  const [contentCount, setContentCount] = useState<number>(0);
  const prevMarkdownTextRef = useRef<null | string>(null);
  const startAutosave = useRef<boolean>(false);
  const lastSaveRef = useRef<number>(0);

  const [selection, setSelection] = useState({ end: 0, start: 0 });

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    const { selection } = event.nativeEvent;
    setSelection(selection);
  };

  useFocusEffect(
    useCallback(() => {
      const chapter = getChapterById(projectId, chapterId, allProjects);
      if (chapter) {
        setSelectedChapter(chapter);
        (async () => {
          try {
            setChapterTitle(chapter.title);
            const markdownTextContent: string = await readFile(
              chapter.androidFilePath,
            );
            setLocalCountOccurrences(countOccurrences(markdownTextContent));
            setMarkdownText(markdownTextContent);

            const selectedProject: Project | undefined = getProjectById(
              projectId,
              allProjects,
            );

            if (selectedProject?.chapterLastViewed === chapterId) {
              setSelection({
                end: selectedProject.cursorLastPosition,
                start: selectedProject.cursorLastPosition,
              });
            }
          } catch (error) {
            Toast.show({
              text1: t('saving_error.text1'),
              text2: t('saving_error.text2'),
              type: 'error',
            });
            print(error);
          }
        })();
      }
    }, []),
  );

  const [writingStats, setWritingStats] = useAtom(WritingStatsStateAtom);

  const saveAndUpdate = () => {
    (async () => {
      if (selectedChapter && startAutosave.current) {
        try {
          const minimizedMarkdownText = minimizeMarkdownText(markdownText);
          const dynamicOccurrences = countOccurrences(minimizedMarkdownText);

          const { totalAdded, totalRemoved } = compareWordFrequencies(
            localCountOccurrences,
            dynamicOccurrences,
          );
          setLocalCountOccurrences(dynamicOccurrences);

          // This check ignores words that are being changed
          if (!(totalAdded === 1 && totalRemoved === 1)) {
            const weekdayKey = getWeekdayKey(dayRef.current);
            const lastEntry = writingStats[weekdayKey].at(-1);

            if (lastEntry?.date === dayRef.current) {
              setWritingStats((prevStats) => {
                const newLastEntry = [...prevStats[weekdayKey]];
                const lastIndex = newLastEntry.length - 1;

                const currentAdded = newLastEntry[lastIndex].writtenWords;
                const currentRemoved = newLastEntry[lastIndex].deletedWords;
                const currentTotal = newLastEntry[lastIndex].totalWords;

                if (lastIndex >= 0) {
                  newLastEntry[lastIndex] = {
                    ...newLastEntry[lastIndex],
                    deletedWords: currentRemoved + totalRemoved,
                    totalWords: currentTotal + (totalAdded - totalRemoved),
                    writtenWords: currentAdded + totalAdded,
                  };
                }
                return {
                  ...prevStats,
                  [weekdayKey]: newLastEntry,
                };
              });
            } else {
              setWritingStats((prevStats) => {
                const newDailyStats: DailyStats = {
                  date: dayRef.current,
                  deletedWords: totalRemoved,
                  totalWords: totalAdded - totalRemoved,
                  writtenWords: totalAdded,
                };
                return {
                  ...prevStats,
                  [weekdayKey]: [...prevStats[weekdayKey], newDailyStats],
                };
              });
            }
          }

          await writeFile(selectedChapter.androidFilePath, markdownText);

          const now = Date.now();
          setAllProjects((prevProjects) =>
            prevProjects.map((project) => {
              if (project.id !== projectId) {
                return project;
              }
              return {
                ...project,
                chapterLastViewed: chapterId,
                chapters: project.chapters.map((chapter) =>
                  chapter.id === chapterId
                    ? {
                        ...chapter,
                        lastUpdate: now,
                        wordCount: countWordsFromHTML(markdownText),
                      }
                    : chapter,
                ),
                cursorLastPosition: selection.start,
                lastUpdate: now,
              };
            }),
          );
          prevMarkdownTextRef.current = markdownText;
        } catch (error) {
          Toast.show({
            text1: t('saving_error.text1'),
            text2: t('saving_error.text2'),
            type: 'error',
          });
          print(error);
        }
      }
    })();
  };

  const onNavigateBack = () => {
    saveAndUpdate();
    navigation.navigate(Paths.ChaptersView, { projectId });
  };

  const onNavigateToStatistics = () => {
    saveAndUpdate();
    navigation.navigate(Paths.StatisticsView, { chapterId, projectId });
  };

  const handleTextChange = (newText: string) => {
    if (!startAutosave.current) {
      startAutosave.current = true;
    }
    setMarkdownText(newText);
  };

  useEffect(() => {
    if (contentCount > 0 && contentCount % 1 === 0) {
      const now = Date.now();
      if (now - lastSaveRef.current < 1500) {
        return;
      }
      lastSaveRef.current = now;
      saveAndUpdate();
    }
  }, [contentCount]);

  useEffect(() => {
    setContentCount(0);
  }, [markdownText]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autosaveMode) {
        setContentCount(
          prevMarkdownTextRef.current === markdownText
            ? 0
            : (count) => count + 1,
        );
      }
    }, 500);
    return () => clearInterval(interval);
  }, [autosaveMode, markdownText]);

  useEffect(() => {
    const checkKeyboard = async () => {
      try {
        const isPhysical = await KeyboardModule.isPhysicalKeyboardConnected();
        setIsPhysicalKeyboard(isPhysical);
        if (isPhysical) {
          Keyboard.dismiss();
        }
      } catch (error) {
        print(error);
      }
    };

    void checkKeyboard();
  }, []);

  const onToggleView = () => {
    saveAndUpdate();
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
            title={chapterTitle}
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
                  cursorColor={colors.purple500}
                  keyboardType="visible-password"
                  markdownStyle={markdownStylesEdit}
                  maxLength={30_000}
                  multiline
                  onChangeText={handleTextChange}
                  onSelectionChange={handleSelectionChange}
                  parser={parseExpensiMark}
                  selection={selection}
                  selectionColor={colors.gray200}
                  showSoftInputOnFocus={!isPhysicalKeyboard}
                  style={[markdownEditStyles]}
                  value={markdownText}
                />
              )}
            </View>
          </ScrollView>
          <StatisticsBar
            onNavigateToStatistics={onNavigateToStatistics}
            viewMode={viewMode}
            wordCount={minimizeMarkdownTextLength(markdownText)}
            wordGoal={1000}
            wordsWrittenToday={357}
          />
        </View>
      )}
    </View>
  );
}

export default ContentView;
