import type { ContextMenuItem } from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import type { ChapterStatusType } from '@/state/defaults';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import CustomContextMenu from '@/components/atoms/CustomContextMenu/CustomContextMenu';

type ChapterProps = {
  drag: () => void;
  editingId: string;
  id: string;
  isActive: boolean;
  lastUpdate: string;
  lastViewedId: string;
  onNavigate: (id: string, chapterId: string) => void;
  projectId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  setReorderingChapters: React.Dispatch<React.SetStateAction<boolean>>;
  status: ChapterStatusType;
  title: string;
  updateChaptersStatus: (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => void;
  wordCount: number;
};

function ChapterCard({
  drag,
  editingId,
  id,
  isActive,
  lastUpdate,
  lastViewedId,
  onNavigate,
  projectId,
  setEditingId,
  setReorderingChapters,
  status,
  title,
  updateChaptersStatus,
  wordCount,
}: ChapterProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const { t } = useTranslation();

  const handleSort = () => {
    setEditingId(id);
  };

  const styles = StyleSheet.create({
    cardContent: {
      alignItems: 'center',
    },
    elevatedBox: {
      backgroundColor: colors.full,
      borderRadius: 10,
      elevation: 4,
      ...gutters.padding_4,
      shadowColor: colors.fullOpposite,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    hiddenIcon: {
      opacity: 0,
    },
    sendToBackground: {
      opacity: 0.3,
      zIndex: 1,
    },
    sendToForeground: {
      zIndex: 200,
    },
  });

  let editingStyle;
  if (editingId.length > 0) {
    editingStyle =
      editingId === id ? styles.sendToForeground : styles.sendToBackground;
  } else {
    editingStyle = undefined;
  }

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
        gutters.marginVertical_12,
        styles.cardContent,
        isActive ? styles.elevatedBox : editingStyle,
      ]}
    >
      <View style={[layout.row, styles.cardContent]}>
        <View style={lastViewedId !== id && styles.hiddenIcon}>
          <TouchableOpacity onPress={handleSort}>
            <Text>
              <SimpleLineIcons
                color={colors.fullOpposite}
                name="cup"
                size={25}
              />
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <CustomContextMenu
            backgroundColor={colors.full}
            menuItems={menuItems}
            menuTitle={`${t('screen_chapters.status_header')} '${title}'`}
            menuTitleBackgroundColor={colors.purple100}
            onPress={() => onNavigate(projectId, id)}
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
        <TouchableOpacity
          onLongPress={drag}
          onPressIn={() => setReorderingChapters(true)}
          onPressOut={() => setReorderingChapters(false)}
        >
          <Text>
            <MaterialIcons color={colors.gray800} name="sort" size={30} />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ChapterCard;
