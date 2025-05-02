import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, DailyStats, Project } from '@/state/defaults';

import { useFocusEffect } from '@react-navigation/native';
import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData} from 'react-native';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  useWindowDimensions,
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
  DailyGoalModeStateAtom,
  DailyWordsStatsStateAtom,
  ProjectsDataStateAtom,
  SaveAtomEffect,
  TypewriterModeStateAtom,
  WordsWrittenTodayStateAtom,
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
  updateWordWrittenTodayRecords,
} from '@/utils/common';
import { print } from '@/utils/logger';

function ContentView({
  navigation,
  route,
}: RootScreenProps<Paths.ContentView>) {
  useAtom(SaveAtomEffect);

  const { t } = useTranslation();

  const { colors, fonts, gutters, layout } = useTheme();
  const { chapterId, projectId } = route.params;

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [wordWrittenToday, setWordsWrittenToday] = useAtom(
    WordsWrittenTodayStateAtom,
  );

  const [dailyWordsStats, setDailyWordsStats] = useAtom(
    DailyWordsStatsStateAtom,
  );

  const typewriterMode = useAtomValue(TypewriterModeStateAtom);
  const autosaveMode = useAtomValue(AutosaveModeStateAtom);

  const [viewMode, setViewMode] = useState<boolean>(true);
  const [chapterTitle, setChapterTitle] = useState<string>(
    t('screen_chapters.no_title'),
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();

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

  const dayRef = useRef<number>(getDateOnlyFromTimestamp(Date.now()));

  useFocusEffect(
    useCallback(() => {
      const chapter = getChapterById(projectId, chapterId, allProjects);

      if (chapter) {
        setSelectedChapter(chapter);

        if (wordWrittenToday.date !== dayRef.current) {
          setWordsWrittenToday({
            date: dayRef.current,
            value: 0,
          });
        }

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
                end: chapter.revisionPosition,
                start: chapter.revisionPosition,
              });
            }
            if (markdownTextContent.length === 0) {
              setViewMode(false);
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

  useEffect(() => {
    const lastEntry = dailyWordsStats.at(-1);
    if (lastEntry?.date === dayRef.current) {
      setDailyWordsStats((prevStats) => {
        const newDailyWordsStats = [...prevStats];
        const lastIndex = newDailyWordsStats.length - 1;
        newDailyWordsStats[lastIndex] = {
          ...newDailyWordsStats[lastIndex],
          totalWords: wordWrittenToday.value,
        };
        return newDailyWordsStats;
      });
    } else {
      const completedRecords = updateWordWrittenTodayRecords(dailyWordsStats, {
        date: dayRef.current,
        totalWords: wordWrittenToday.value,
      });
      setDailyWordsStats(completedRecords);
    }
  }, [wordWrittenToday]);

  const [writingStats, setWritingStats] = useAtom(WritingStatsStateAtom);
  const dailyGoalMode = useAtomValue(DailyGoalModeStateAtom);

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
          if (totalAdded !== totalRemoved) {
            const weekdayKey = getWeekdayKey(dayRef.current);
            const lastEntry = writingStats[weekdayKey].at(-1);

            if (
              lastEntry &&
              dayRef.current &&
              lastEntry.date === dayRef.current
            ) {
              setWritingStats((prevStats) => {
                const newLastEntry = [...prevStats[weekdayKey]];
                const lastIndex = newLastEntry.length - 1;

                const currentAdded = newLastEntry[lastIndex].writtenWords;
                const currentRemoved = newLastEntry[lastIndex].deletedWords;
                const currentTotal = newLastEntry[lastIndex].totalWords;

                setWordsWrittenToday((prevState) => ({
                  ...prevState,
                  value: prevState.value + totalAdded,
                }));

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
              setWordsWrittenToday((prevState) => ({
                ...prevState,
                value: totalAdded,
              }));
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

              const updatedChapters = project.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? {
                      ...chapter,
                      lastUpdate: now,
                      revisionPosition: selection.start,
                      wordCount: countWordsFromHTML(markdownText),
                    }
                  : chapter,
              );

              const totalWordCount = updatedChapters.reduce(
                (acc, chap) => acc + (chap.wordCount ?? 0),
                0,
              );

              const totalSentenceCount = updatedChapters.reduce(
                (acc, chap) => acc + (chap.sentencesCount ?? 0),
                0,
              );

              return {
                ...project,
                chapterLastViewed: chapterId,
                chapters: updatedChapters,
                lastUpdate: now,
                sentencesCount: totalSentenceCount,
                wordCount: totalWordCount,
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
        if (typewriterMode) {
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

  const { height: winH } = useWindowDimensions();

  const styles = StyleSheet.create({
    markdownContent: {
      backgroundColor: colors.gray50 + '5F',
      height: '100%',
      marginBottom: 64,
    },
    markdownContentEdit: {
      backgroundColor: colors.full,
      marginBottom: 64,
      marginTop: 0,
      padding: 0,
    },
    markdownEditContainer: {
      marginTop: -20,
      paddingTop: 10,
    },
    markdownEditStyles: {
      ...fonts.size_16,
      ...fonts.gray800,
      borderWidth: 0,
      fontFamily: 'monospace',
      height: winH - 91,
      lineHeight: 24,
      marginHorizontal: 0,
      marginTop: 10,
      padding: 0,
      verticalAlign: 'middle',
    },
  });

  return (
    <View style={[layout.flex_1, { margin: 0 }]}>
      {selectedChapter && (
        <View style={layout.flex_1}>
          <TitleBar
            onNavigateBack={onNavigateBack}
            onToggleView={!typewriterMode ? onToggleView : undefined}
            title={chapterTitle}
            viewMode={viewMode}
          />
          <View
            style={[gutters.paddingHorizontal_8, gutters.marginHorizontal_8]}
          >
            <View
              style={
                viewMode ? styles.markdownContent : styles.markdownContentEdit
              }
            >
              {viewMode ? (
                <MarkdownRenderer markdown={markdownText} />
              ) : (
                <View style={styles.markdownEditContainer}>
                  <TextInput
                    autoCapitalize="none"
                    autoFocus
                    cursorColor={colors.purple500}
                    inputMode="text"
                    keyboardType="default"
                    maxLength={30_000}
                    multiline
                    onChangeText={handleTextChange}
                    onSelectionChange={handleSelectionChange}
                    selection={selection}
                    showSoftInputOnFocus={!typewriterMode}
                    style={styles.markdownEditStyles}
                    value={markdownText}
                  />
                </View>
              )}
            </View>
          </View>
          <StatisticsBar
            onNavigateToStatistics={onNavigateToStatistics}
            viewMode={viewMode}
            wordCount={minimizeMarkdownTextLength(markdownText)}
            wordGoal={dailyGoalMode.enabled ? dailyGoalMode.target : -1}
            wordsWrittenToday={wordWrittenToday.value}
          />
        </View>
      )}
    </View>
  );
}

export default ContentView;
