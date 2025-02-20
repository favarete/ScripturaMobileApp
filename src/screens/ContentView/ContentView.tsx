import type { MarkdownStyle } from '@expensify/react-native-live-markdown';
import type { RootScreenProps } from '@/navigation/types';
import { Chapter } from '@/state/defaults';

import {
  MarkdownTextInput,
  parseExpensiMark,
} from '@expensify/react-native-live-markdown';
import { useAtomValue } from 'jotai/index';
import { useAtom } from 'jotai/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  SaveAtomEffect, WritingStatsRawStateAtom, WritingStatsStateAtom
} from '@/state/atoms/persistentContent';
import { countWordsFromHTML, getChapterById } from '@/utils/chapterHelpers';
import { print } from '@/utils/logger';
import {
  getDateOnlyFromTimestamp,
  getLastInsertedChar,
  getWeekdayKey,
} from '@/utils/common';
import { useFocusEffect } from '@react-navigation/native';

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
  const [writingStatsRaw, setWritingStatsRaw] = useAtom(WritingStatsRawStateAtom);

  const autosaveMode = useAtomValue(AutosaveModeStateAtom);

  const [viewMode, setViewMode] = useState<boolean>(true);
  const [isPhysicalKeyboard, setIsPhysicalKeyboard] = useState<boolean>(false);

  const [chapterTitle, setChapterTitle] = useState<string>(
    t('screen_chapters.no_title'),
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const [markdownText, setMarkdownText] = useState<string>('');

  const [contentCount, setContentCount] = useState<number>(0);

  const prevMarkdownTextRef = useRef<null | string>(null);
  const startAutosave = useRef<boolean>(false);
  const lastSaveRef = useRef<number>(0);

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

            const dateOnlyTimestamp = getDateOnlyFromTimestamp(Date.now());
            if(writingStatsRaw.timestamp === 0 || dateOnlyTimestamp !== writingStatsRaw.timestamp) {
              setWritingStatsRaw({
                text: '',
                timestamp: dateOnlyTimestamp
              });
            }
            setMarkdownText(markdownTextContent);
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
    }, [])
  );

  const saveAndUpdate = () => {
    (async () => {
      if (selectedChapter && startAutosave.current) {
        try {
          await writeFile(selectedChapter.androidFilePath, markdownText);

          const now = Date.now();
          setAllProjects((prevProjects) =>
            prevProjects.map((project) => {
              if (project.id !== projectId) return project;
              return {
                ...project,
                chapterLastViewed: chapterId,
                lastUpdate: now,
                chapters: project.chapters.map((chapter) =>
                  chapter.id === chapterId
                    ? {
                        ...chapter,
                        wordCount: countWordsFromHTML(markdownText),
                        lastUpdate: now,
                      }
                    : chapter,
                ),
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

  const [writingStats, setWritingStats] = useAtom(WritingStatsStateAtom);

  const lastPressedCharacterRef = useRef<string>('');
  const handleTextChange = (newText: string) => {
    if(!startAutosave.current){
      startAutosave.current = true;
    }
    const lastChar = getLastInsertedChar(markdownText, newText);
    if (lastChar) {
      if(lastChar === ' ' && lastPressedCharacterRef.current !== ' ') {

        const timestampNow = Date.now()
        const weekday = getWeekdayKey(timestampNow)
        const dateOnlyTimestamp = getDateOnlyFromTimestamp(timestampNow);

        // const updateLastObject = (updates: Partial<Item>) => {
        //   setState((prevState) => {
        //     // Copy all elements except the last
        //     const newArray = [...prevState];
        //     // Update the last object without mutating the original one
        //     newArray[newArray.length - 1] = {
        //       ...newArray[newArray.length - 1],
        //       ...updates,
        //     };
        //
        //     return newArray; // Return the updated array
        //   });
        // };


        const statsVault = writingStats[weekday];
        if(statsVault.length > 0) {
          console.log('Atualiza')
          const updateStats = statsVault[statsVault.length - 1]
          updateStats.totalWords = writingStatsRaw.text.length;
          updateStats.writtenWords += 1;
          updateStats.deletedWords = updateStats.writtenWords - updateStats.totalWords;
          updateStats.__rawText = writingStatsRaw.text;
          console.log(updateStats)
        }
        else {
          console.log('Cria')
          const initialStats = {
            date: dateOnlyTimestamp,
            totalWords: 1,
            deletedWords: 0,
            writtenWords: 1,
            __rawText: writingStatsRaw.text,
          }
          console.log(initialStats)
        }
      }
      lastPressedCharacterRef.current = lastChar;
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
                  parser={parseExpensiMark}
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
