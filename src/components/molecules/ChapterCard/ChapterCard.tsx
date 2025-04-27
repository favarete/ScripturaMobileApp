import type { ContextMenuItem } from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import type { Chapter, ChapterStatusType, Project } from '@/state/defaults';

import FeatherIcons from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { unlink } from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';

import ConfirmationDialog from '@/components/atoms/ConfirmationDialog/ConfirmationDialog';
import CustomContextMenu from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import ContentDestroyer from '@/components/molecules/ContentDestroyer/ContentDestroyer';

import {
  HomeFolderStateAtom,
  ProjectsDataStateAtom, SaveAtomEffect,
  TypewriterModeStateAtom
} from '@/state/atoms/persistentContent';
import {
  DisableAllNavigationStateAtom,
  SelectedChapterStateAtom,
} from '@/state/atoms/temporaryContent';
import { getChapterById } from '@/utils/chapterHelpers';
import { print } from '@/utils/logger';
import { getSupportFile } from '@/utils/projectHelpers';

export type ChapterCardProps = {
  changeChapterTitle: (chapterId: string, newTitle: string) => void;
  drag: () => void;
  id: string;
  isActive: boolean;
  isEditingChapterTitle: string;
  lastUpdate: string;
  lastViewedId: string;
  onNavigate: (chapterId: string) => void;
  projectId: string;
  setIsEditingChapterTitle: React.Dispatch<React.SetStateAction<string>>;
  status: ChapterStatusType;
  title: string;
  triggerUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  updateChaptersStatus: (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => void;
  wordCount: number;
};

export const EDIT_CHAPTER_TITLE_TYPE = 'edit-chapter-title';
const truncateText = (text: string) => {
  if (text.length > 25) {
    return text.slice(0, 25) + '...';
  }
  return text;
};

function ChapterCard({
  changeChapterTitle,
  drag,
  id,
  isActive,
  isEditingChapterTitle,
  lastUpdate,
  lastViewedId,
  onNavigate,
  projectId,
  setIsEditingChapterTitle,
  status,
  title,
  triggerUpdate,
  updateChaptersStatus,
  wordCount,
}: ChapterCardProps) {
  useAtom(SaveAtomEffect);
  const { colors, fonts, gutters, layout } = useTheme();

  const { t } = useTranslation();

  const selectedChapterId = useAtomValue(SelectedChapterStateAtom);
  const setAllProjects = useSetAtom(ProjectsDataStateAtom);
  const homeFolder = useAtomValue(HomeFolderStateAtom);
  const typewriterMode = useAtomValue(TypewriterModeStateAtom);
  const [disableAllNavigation, setDisableAllNavigation] = useAtom(
    DisableAllNavigationStateAtom,
  );
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const styles = StyleSheet.create({
    adornmentContainer: {
      borderRadius: 50,
      color: colors.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
    },
    adornmentContainerTitle: {
      backgroundColor:
        editedTitle.length < 25 ? colors.purple500 : colors.red500,
    },
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
    inputTitleContainer: {
      backgroundColor: 'transparent',
      borderBottomColor: colors.purple500,
      borderBottomWidth: 1,
      height: 24,
      marginBottom: 2.5,
    },
    inputTitleContent: {
      backgroundColor: 'transparent',
      height: 24,
      includeFontPadding: false,
      lineHeight: 24,
      paddingBottom: 1,
      paddingLeft: 0,
      paddingTop: 1,
      textAlignVertical: 'center',
    },
  });

  useEffect(() => {
    if (isEditingChapterTitle.length + selectedChapterId.length !== 0) {
      setDisableAllNavigation(true);
    } else {
      setDisableAllNavigation(false);
    }
  }, [id, selectedChapterId, isEditingChapterTitle]);

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
    {
      color: colors.gray800,
      icon: (
        <FeatherIcons color={colors.gray800} name="edit-3" size={ICON_SIZE} />
      ),
      label: t('screen_projects.cards.edit_title'),
      onPress: () => {
        setIsEditingChapterTitle(id);
      },
    },
    {
      color: colors.red500,
      icon: (
        <MaterialIcons color={colors.red500} name="delete" size={ICON_SIZE} />
      ),
      label: 'Delete',
      onPress: () => {
        setDeleteDialog(true);
      },
    },
  ];

  const destroyContent = async (shouldDestroy: boolean) => {
    if (shouldDestroy) {
      try {
        const allProjectsFromFile: Project[] = await getSupportFile(homeFolder);
        const selectedChapter: Chapter | null = getChapterById(
          projectId,
          id,
          allProjectsFromFile,
        );
        if (selectedChapter) {
          await unlink(selectedChapter.androidFilePath);
          const filteredProjects = allProjectsFromFile.map((project) => {
            if (project.id !== projectId) {
              return project;
            }
            const updatedChapters = project.chapters.filter(
              (ch) => ch.id !== id,
            );
            const updatedChapterSort = project.chapterSort.filter(
              (_id) => _id !== id,
            );
            const updatedLastViewed =
              project.chapterLastViewed === id ? '' : project.chapterLastViewed;
            return {
              ...project,
              chapterLastViewed: updatedLastViewed,
              chapters: updatedChapters,
              chapterSort: updatedChapterSort,
            };
          });
          setAllProjects(filteredProjects);
          Toast.show({
            text1: t('screen_chapters.file_deleted.text1'),
            text2: t('screen_chapters.file_deleted.text2'),
            type: 'success',
          });
        }
      } catch (error) {
        Toast.show({
          text1: t('unknown_error.text1'),
          text2: t('unknown_error.text2'),
          type: 'error',
        });
        print(error);
      } finally {
        triggerUpdate(true);
      }
    }
    setDeleteDialog(false);
  };

  const handleDialogClick = (action: string, dialogType: string): void => {
    if (dialogType === 'save') {
      if (action === EDIT_CHAPTER_TITLE_TYPE) {
        changeChapterTitle(id, editedTitle);
      }
    }
    setIsEditingChapterTitle('');
  };

  const noInteraction =
    isEditingChapterTitle.length + selectedChapterId.length === 0;
  const selectingStatus =
    isEditingChapterTitle.length === 0 && selectedChapterId.length !== 0;
  const editingTitle = isEditingChapterTitle.length !== 0;
  const interactionFocus =
    isEditingChapterTitle === id || selectedChapterId === id;

  const sendToBackground = useMemo(
    () => ({
      opacity: 0.3,
      zIndex: 1,
    }),
    [],
  );
  const sendToForeground = useMemo(
    () => ({
      zIndex: 200,
    }),
    [],
  );

  let titleDynamicStyle;
  let statusDynamicStyle;
  let dateDynamicStyle;
  let iconsDynamicStyle;

  if (noInteraction) {
    titleDynamicStyle = sendToForeground;
    statusDynamicStyle = sendToForeground;
    dateDynamicStyle = sendToForeground;
    iconsDynamicStyle = sendToForeground;
  } else if (selectingStatus) {
    if (interactionFocus) {
      titleDynamicStyle = sendToForeground;
      statusDynamicStyle = sendToForeground;
      dateDynamicStyle = sendToForeground;
      iconsDynamicStyle = sendToForeground;
    } else {
      titleDynamicStyle = sendToBackground;
      statusDynamicStyle = sendToBackground;
      dateDynamicStyle = sendToBackground;
      iconsDynamicStyle = sendToBackground;
    }
  } else if (editingTitle) {
    if (interactionFocus) {
      titleDynamicStyle = sendToForeground;
      statusDynamicStyle = sendToBackground;
      dateDynamicStyle = sendToBackground;
      iconsDynamicStyle = sendToBackground;
    } else {
      titleDynamicStyle = sendToBackground;
      statusDynamicStyle = sendToBackground;
      dateDynamicStyle = sendToBackground;
      iconsDynamicStyle = sendToBackground;
    }
  } else {
    titleDynamicStyle = sendToForeground;
    statusDynamicStyle = sendToForeground;
    dateDynamicStyle = sendToForeground;
    iconsDynamicStyle = sendToForeground;
  }

  const handleNavigate = () => {
    if (!disableAllNavigation) {
      onNavigate(id);
    }
  };

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
      <View style={[layout.row, styles.cardContent]}>
        <View style={lastViewedId !== id && styles.hiddenIcon}>
          <Text style={iconsDynamicStyle}>
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
            onPress={handleNavigate}
          >
            <View
              style={[
                layout.flex_1,
                layout.itemsStretch,
                layout.col,
                gutters.paddingHorizontal_16,
              ]}
            >
              {isEditingChapterTitle === id ? (
                <View style={styles.inputTitleContainer}>
                  <TextInput
                    autoFocus
                    cursorColor={colors.purple500}
                    keyboardType="visible-password"
                    maxLength={25}
                    onChangeText={setEditedTitle}
                    selectionColor={colors.gray200}
                    showSoftInputOnFocus={!typewriterMode}
                    style={[
                      styles.inputTitleContent,
                      fonts.defaultFontFamilyBold,
                      fonts.fullOpposite,
                      fonts.size_16,
                      gutters.marginBottom_4,
                    ]}
                    value={editedTitle}
                  />
                  <ConfirmationDialog
                    dialogType={EDIT_CHAPTER_TITLE_TYPE}
                    handleDialogClick={handleDialogClick}
                  >
                    <Text
                      style={[
                        fonts.defaultFontFamilySemibold,
                        fonts.size_12,
                        styles.adornmentContainer,
                        styles.adornmentContainerTitle,
                      ]}
                    >
                      {editedTitle.length}/25
                    </Text>
                  </ConfirmationDialog>
                </View>
              ) : (
                <Text
                  style={[
                    fonts.defaultFontFamilyBold,
                    fonts.fullOpposite,
                    fonts.size_16,
                    gutters.marginBottom_4,
                    titleDynamicStyle,
                  ]}
                >
                  {title}
                </Text>
              )}
              <Text
                style={[fonts.size_12, styles.cardContent, statusDynamicStyle]}
              >
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
                  dateDynamicStyle,
                ]}
              >
                <Text>{lastUpdate}</Text>
              </Text>
            </View>
          </CustomContextMenu>
          <ContentDestroyer
            destroyContent={destroyContent}
            show={deleteDialog}
            title={`${truncateText(`${t('components.delete_project')} \"${title}`)}\"?`}
          />
        </View>
      </View>
      <View style={iconsDynamicStyle}>
        <TouchableOpacity disabled={disableAllNavigation} onLongPress={drag}>
          <Text>
            <MaterialIcons color={colors.gray800} name="sort" size={30} />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ChapterCard;
