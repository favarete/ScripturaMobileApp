import type { ContextMenuItem } from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import type { ChapterStatusType } from '@/state/defaults';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import { useAtomValue } from 'jotai';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import CustomContextMenu from '@/components/atoms/CustomContextMenu/CustomContextMenu';

import { SelectedChapterStateAtom } from '@/state/atoms/temporaryContent';

export type ChapterCardProps = {
  drag: () => void;
  id: string;
  isActive: boolean;
  lastUpdate: string;
  lastViewedId: string;
  onNavigate: (chapterId: string) => void;
  projectId: string;
  status: ChapterStatusType;
  title: string;
  updateChaptersStatus: (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => void;
  wordCount: number;
};

type DynamicStyleType = { opacity?: number; zIndex: number } | undefined;

function ChapterCard({
  drag,
  id,
  isActive,
  lastUpdate,
  lastViewedId,
  onNavigate,
  projectId,
  status,
  title,
  updateChaptersStatus,
  wordCount,
}: ChapterCardProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const { t } = useTranslation();

  const selectedChapterId = useAtomValue(SelectedChapterStateAtom);
  const [dynamicStyle, setDynamicStyle] = useState<DynamicStyleType>();

  const styles = StyleSheet.create({
    cardContent: {
      alignItems: 'center',
      ...gutters.paddingVertical_4,
    },
    elevatedBox: {
      backgroundColor: colors.purple100 + '4E',
      borderRadius: 10,
    },
    hiddenIcon: {
      opacity: 0,
    },
  });

  const sendToBackground = useMemo(() => ({
    opacity: 0.3,
    zIndex: 1,
  }), []);
  const sendToForeground = useMemo(() => ({
    zIndex: 200,
  }), []);

  useEffect(() => {
    if (selectedChapterId.length === 0) {
      setDynamicStyle(sendToForeground);
    } else {
      if (selectedChapterId === id) {
        setDynamicStyle(sendToForeground);
      } else {
        setDynamicStyle(sendToBackground);
      }
    }
  }, [id, selectedChapterId, sendToBackground, sendToForeground]);

  const ICON_SIZE = 20;
  const menuItems: ContextMenuItem[] = [
    {
      color: colors.gray800,
      disabled: status === 'indeterminate',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.indeterminate'),
      onPress: () => updateChaptersStatus(projectId, id, 'indeterminate'),
    },
    {
      color: colors.gray800,
      disabled: status === 'to_do',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.to_do'),
      onPress: () => updateChaptersStatus(projectId, id, 'to_do'),
    },
    {
      color: colors.gray800,
      disabled: status === 'in_progress',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.in_progress'),
      onPress: () => updateChaptersStatus(projectId, id, 'in_progress'),
    },
    {
      color: colors.gray800,
      disabled: status === 'draft_ready',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.draft_ready'),
      onPress: () => updateChaptersStatus(projectId, id, 'draft_ready'),
    },
    {
      color: colors.gray800,
      disabled: status === 'in_first_revision',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.in_first_revision'),
      onPress: () => updateChaptersStatus(projectId, id, 'in_first_revision'),
    },
    {
      color: colors.gray800,
      disabled: status === 'first_revision_done',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.first_revision_done'),
      onPress: () => updateChaptersStatus(projectId, id, 'first_revision_done'),
    },
    {
      color: colors.gray800,
      disabled: status === 'in_second_revision',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.in_second_revision'),
      onPress: () => updateChaptersStatus(projectId, id, 'in_second_revision'),
    },
    {
      color: colors.gray800,
      disabled: status === 'second_revision_done',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.second_revision_done'),
      onPress: () =>
        updateChaptersStatus(projectId, id, 'second_revision_done'),
    },
    {
      color: colors.gray800,
      disabled: status === 'in_third_revision',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.in_third_revision'),
      onPress: () => updateChaptersStatus(projectId, id, 'in_third_revision'),
    },
    {
      color: colors.gray800,
      disabled: status === 'third_revision_done',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.third_revision_done'),
      onPress: () => updateChaptersStatus(projectId, id, 'third_revision_done'),
    },
    {
      color: colors.gray800,
      disabled: status === 'manuscript_done',
      icon: (
        <MaterialIcons
          color={colors.purple500}
          name="label-important-outline"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_chapters.status.manuscript_done'),
      onPress: () => updateChaptersStatus(projectId, id, 'manuscript_done'),
    },
  ];

  return (
    <View
      style={[
        layout.row,
        layout.justifyBetween,
        gutters.marginHorizontal_32,
        styles.cardContent,
        isActive && styles.elevatedBox,
      ]}
    >
      <View style={[layout.row, styles.cardContent, dynamicStyle]}>
        <View style={lastViewedId !== id && styles.hiddenIcon}>
          <Text>
            <SimpleLineIcons color={colors.gray400} name="cup" size={25} />
          </Text>
        </View>
        <View>
          <CustomContextMenu
            backgroundColor={colors.full}
            id={id}
            menuItems={menuItems}
            menuTitle={`${t('screen_chapters.status_header')} '${title}'`}
            menuTitleBackgroundColor={colors.purple100}
            onPress={() => onNavigate(id)}
          >
            <View
              style={[
                layout.flex_1,
                layout.itemsStretch,
                layout.col,
                gutters.paddingHorizontal_16,
              ]}
            >
              <Text
                style={[
                  fonts.defaultFontFamilyBold,
                  fonts.fullOpposite,
                  fonts.size_16,
                  gutters.marginBottom_4,
                ]}
              >
                {title}
              </Text>
              <Text style={[fonts.size_12, styles.cardContent]}>
                <Text style={[fonts.defaultFontFamilyBold, fonts.purple500]}>
                  {t(`screen_chapters.status.${status}`)}
                </Text>
                <Text style={[fonts.defaultFontFamilyRegular, fonts.gray800]}>
                  {` | ${t('screen_chapters.word_count')}: ${wordCount}`}
                </Text>
              </Text>
              <Text
                style={[
                  fonts.defaultFontFamilyRegular,
                  fonts.gray400,
                  fonts.size_12,
                  styles.cardContent,
                ]}
              >
                <Text>{lastUpdate}</Text>
              </Text>
            </View>
          </CustomContextMenu>
        </View>
      </View>
      <View>
        <TouchableOpacity onLongPress={drag}>
          <Text>
            <MaterialIcons color={colors.gray800} name="sort" size={30} />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ChapterCard;
