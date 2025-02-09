import type { Chapter, Project } from '@/state/defaults';

import { useAtomValue } from 'jotai/index';
import React, { Dispatch, FC, memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ImageSourcePropType,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from 'react-native-reorderable-list';

import { useTheme } from '@/theme';

import { TitleBar } from '@/components/atoms';
import ChapterCard from '@/components/molecules/ChapterCard/ChapterCard';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import { formatNumber } from '@/utils/chapterHelpers';
import { formatDateTime } from '@/utils/common';

const IMG_HEIGHT = 180;

type ChaptersDynamicListType = {
  onNavigateBack: () => void;
  parallaxImage: ImageSourcePropType;
  parallaxSubtitle: string;
  parallaxTitle: string;
  projectId: string;
  editingId: string;
  selectedBook: Project;
  allChaptersSorted: Chapter[];
  setReorderingChapter: Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  onNavigate: (projectId: string, chapterId: string) => void;
  updateChaptersStatus: (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => void;
  setAllChaptersSorted: React.Dispatch<React.SetStateAction<Chapter[]>>;
};

export function ChaptersDynamicList({
  onNavigateBack,
  onNavigate,
  parallaxImage,
  parallaxSubtitle,
  parallaxTitle,
  selectedBook,
  editingId,
  updateChaptersStatus,
  setReorderingChapter,
  setEditingId,
  projectId,
  setAllChaptersSorted,
  allChaptersSorted,
}: ChaptersDynamicListType) {
  const language = useAtomValue(LanguageStateAtom);

  const { colors, fonts, gutters } = useTheme();
  const { t } = useTranslation();

  const listRef = useRef<FlatList<Chapter>>(null);
  const scrollY = useSharedValue(0);

  const ChapterCardInstance: FC<Chapter> = memo(
    ({ id, title, lastUpdate, status, wordCount }) => {
      const drag = useReorderableDrag();

      // const ChapterCardInstance: FC<Chapter> = memo(
      //   ({ id, title, lastUpdate, status, wordCount }) => {
      //     const drag = useReorderableDrag();
      //
      //     return (
      //       <Pressable onLongPress={drag}>
      //         <Text>Card {id}</Text>
      //       </Pressable>
      //     );
      //   },
      // );

      return (
        <ChapterCard
          drag={drag}
          editingId={editingId}
          id={id}
          key={id}
          lastUpdate={chapterUpdatedOn(lastUpdate)}
          lastViewedId={selectedBook.chapterLastViewed}
          onNavigate={onNavigate}
          projectId={projectId}
          setEditingId={setEditingId}
          status={status}
          title={title}
          updateChaptersStatus={updateChaptersStatus}
          wordCount={wordCount}
        />
      );
    },
  );

  const renderItem = ({ item }: ListRenderItemInfo<Chapter>) => (
    <ChapterCardInstance {...item} />
  );

  const chapterUpdatedOn = (dateInteger: number): string => {
    const { content, isToday } = formatDateTime(dateInteger, language);
    const moment = isToday ? 'today' : 'past';

    return `${t(`screen_chapters.chapter_updated_at.${moment}`)} ${content}`;
  };

  const styles = StyleSheet.create({
    header: {
      position: 'absolute',
      width: '100%',
      top: -IMG_HEIGHT,
    },
    childrenContainer: {
      backgroundColor: colors.full,
    },
    overlay: {
      alignItems: 'flex-start',
      bottom: 0,
      justifyContent: 'flex-end',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    overlayText: {
      color: colors.full,
    },
    image: {
      height: IMG_HEIGHT,
      filter: 'brightness(20%)',
      resizeMode: 'cover',
      width: '100%',
    },
    imageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: IMG_HEIGHT,
      overflow: 'hidden',
    },
    listContainer: {
      paddingTop: IMG_HEIGHT,
    },
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, IMG_HEIGHT],
            [0, -IMG_HEIGHT * 0.5],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [1.2, 1, 1],
          ),
        },
      ],
    };
  });

  function handleReorder({ from, to }: ReorderableListReorderEvent) {
    setAllChaptersSorted((value) => reorderItems(value, from, to));
  }

  const formatedWordCount = formatNumber(0, language);

  return (
    <View>
      <View style={styles.imageContainer}>
        <Animated.Image
          source={parallaxImage}
          style={[styles.image, imageAnimatedStyle]}
        />
        <Animated.View
          style={[
            styles.overlay,
            gutters.paddingHorizontal_16,
            gutters.paddingVertical_12,
            imageAnimatedStyle,
          ]}
        >
          <View style={[gutters.paddingLeft_24, gutters.paddingBottom_24]}>
            <Text
              style={[
                fonts.defaultFontFamilyBold,
                fonts.size_12,
                gutters.marginBottom_8,
                styles.overlayText,
              ]}
            >
              {`${t('screen_chapters.total_word_count')} ${formatedWordCount}`}
            </Text>
            <Text
              style={[
                fonts.defaultFontFamilySemibold,
                fonts.size_12,
                styles.overlayText,
              ]}
            >
              {parallaxSubtitle}
            </Text>
          </View>
        </Animated.View>
      </View>
      <ReorderableList
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <TitleBar onNavigateBack={onNavigateBack} title={parallaxTitle} />
          </View>
        }
        ref={listRef}
        onScroll={scrollHandler}
        data={allChaptersSorted}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
