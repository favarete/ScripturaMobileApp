import type { FC } from 'react';
import type {
  FlatList,
  ImageSourcePropType,
  ListRenderItemInfo,
} from 'react-native';
import type { ReorderableListReorderEvent } from 'react-native-reorderable-list';
import type { Chapter } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai';
import React, { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import ReorderableList, {
  reorderItems,
  useIsActive,
  useReorderableDrag,
} from 'react-native-reorderable-list';

import { useTheme } from '@/theme';

import { TitleBar } from '@/components/atoms';
import ChapterCard from '@/components/molecules/ChapterCard/ChapterCard';
import ContentCreator from '@/components/molecules/ContentCreator/ContentCreator';

import {
  LanguageStateAtom,
  SaveAtomEffect,
} from '@/state/atoms/persistentContent';
import { formatNumber } from '@/utils/chapterHelpers';
import { formatDateTime } from '@/utils/common';
import { IsPortraitStateAtom } from '@/state/atoms/temporaryContent';

const IMG_HEIGHT = 180;

type ChaptersDynamicListType = {
  allChaptersSorted: Chapter[];
  changeChapterTitle: (chapterId: string, newTitle: string) => void;
  footerAction: (chapterName: string) => Promise<void>;
  isEditingChapterTitle: string;
  isLoading: boolean;
  lastChapterViewed: string;
  onNavigate: (chapterId: string) => void;
  onNavigateBack: () => void;
  parallaxImage: ImageSourcePropType;
  parallaxSubtitle: string;
  parallaxTitle: string;
  projectId: string;
  projectWordCount: number;
  setAllChaptersSorted: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setIsEditingChapterTitle: React.Dispatch<React.SetStateAction<string>>;
  triggerUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  updateChaptersStatus: (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => void;
};

export function ChaptersDynamicList({
  allChaptersSorted,
  changeChapterTitle,
  footerAction,
  isEditingChapterTitle,
  isLoading,
  lastChapterViewed,
  onNavigate,
  onNavigateBack,
  parallaxImage,
  parallaxSubtitle,
  parallaxTitle,
  projectId,
  projectWordCount,
  setAllChaptersSorted,
  setIsEditingChapterTitle,
  triggerUpdate,
  updateChaptersStatus,
}: ChaptersDynamicListType) {
  useAtom(SaveAtomEffect);
  const language = useAtomValue(LanguageStateAtom);

  const { colors, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const listRef = useRef<FlatList<Chapter>>(null);
  const scrollY = useSharedValue(0);
  const isPortrait = useAtomValue(IsPortraitStateAtom);

  const ChapterCardInstance: FC<Chapter> = memo(
    ({ id, lastUpdate, status, title, wordCount }) => {
      const drag = useReorderableDrag();
      const isActive = useIsActive();

      return (
        <View style={!isPortrait && gutters.marginHorizontal_160}>
          <ChapterCard
            changeChapterTitle={changeChapterTitle}
            drag={drag}
            id={id}
            isActive={isActive}
            isEditingChapterTitle={isEditingChapterTitle}
            key={id}
            lastUpdate={chapterUpdatedOn(lastUpdate)}
            lastViewedId={lastChapterViewed}
            onNavigate={onNavigate}
            projectId={projectId}
            setIsEditingChapterTitle={setIsEditingChapterTitle}
            status={status}
            title={title}
            triggerUpdate={triggerUpdate}
            updateChaptersStatus={updateChaptersStatus}
            wordCount={wordCount}
          />
        </View>
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
    childrenContainer: {
      backgroundColor: colors.full,
    },
    flatList: {
      height: '100%',
    },
    header: {
      position: 'absolute',
      top: -IMG_HEIGHT,
      width: '100%',
    },
    image: {
      filter: 'brightness(0.2), saturate(0.2)',
      height: IMG_HEIGHT,
      resizeMode: 'cover',
      width: '100%',
    },
    imageContainer: {
      height: IMG_HEIGHT,
      left: 0,
      overflow: 'hidden',
      position: 'absolute',
      right: 0,
      top: 0,
    },
    listContainer: {
      paddingTop: IMG_HEIGHT,
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
      color: colors.light,
    },
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, IMG_HEIGHT],
      [0, -IMG_HEIGHT * 0.5],
    );

    const scale = interpolate(
      scrollY.value,
      [-IMG_HEIGHT, 0, IMG_HEIGHT],
      [1.2, 1, 1],
    );

    const opacity = interpolate(scrollY.value, [0, IMG_HEIGHT], [1, 0]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    setAllChaptersSorted((value) => reorderItems(value, from, to));
  };

  const formatedWordCount = formatNumber(projectWordCount, language);

  return (
    <View style={styles.flatList}>
      {!isLoading && (
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
      )}
      <ReorderableList
        contentContainerStyle={styles.listContainer}
        data={allChaptersSorted}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          <View
            style={[
              layout.itemsCenter,
              layout.fullWidth,
              { zIndex: -10 },
              gutters.marginTop_4,
            ]}
          >
            <ContentCreator
              createContent={footerAction}
              subtitle={t('screen_chapters.file_name')}
              title={t('screen_chapters.create_file')}
            />
          </View>
        }
        ListHeaderComponent={
          <View style={gutters.marginBottom_16}>
            <View style={styles.header}>
              <TitleBar onNavigateBack={onNavigateBack} title={parallaxTitle} />
            </View>
          </View>
        }
        onReorder={handleReorder}
        onScroll={scrollHandler}
        ref={listRef}
        renderItem={renderItem}
        shouldUpdateActiveItem
        style={gutters.marginBottom_80}
      />
    </View>
  );
}
