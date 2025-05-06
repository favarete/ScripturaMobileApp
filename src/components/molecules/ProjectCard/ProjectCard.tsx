import type { ImageURISource } from 'react-native';
import type { DocumentFileDetail } from 'react-native-saf-x';
import type { ContextMenuItem } from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import type { Project } from '@/state/defaults';

import FeatherIcons from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  hasPermission,
  openDocument,
  readFile,
  unlink,
} from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import PlaceholderImageDark from '@/theme/assets/images/dark/placeholder_book_cover.png';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';

import ConfirmationDialog from '@/components/atoms/ConfirmationDialog/ConfirmationDialog';
import CustomContextMenu from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import ContentDestroyer from '@/components/molecules/ContentDestroyer/ContentDestroyer';

import {
  HomeFolderStateAtom,
  ProjectsDataStateAtom,
  ThemeStateAtom,
  TypewriterModeStateAtom,
} from '@/state/atoms/persistentContent';
import {
  DisableAllNavigationStateAtom,
  ItemEditStateAtom,
} from '@/state/atoms/temporaryContent';
import { getProjectById } from '@/utils/chapterHelpers';
import { print } from '@/utils/logger';
import { getSupportFile } from '@/utils/projectHelpers';

type ProjectProps = {
  changeProjectDescription: (projectId: string, newDescription: string) => void;
  changeProjectImage: (projectId: string, imagePath: string) => void;
  changeProjectTitle: (projectId: string, newTitle: string) => void;
  description: string;
  drag: () => void;
  id: string;
  image: null | string;
  isActive: boolean;
  onNavigate: (id: string) => void;
  title: string;
  triggerUpdate: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EDIT_TITLE_TYPE = 'edit-title';
export const EDIT_DESCRIPTION_TYPE = 'edit-description';
export const CHANGE_IMAGE_TYPE = 'change-image';

const truncateText = (text: string) => {
  if (text.length > 25) {
    return text.slice(0, 25) + '...';
  }
  return text;
};

function ProjectCard({
  changeProjectDescription,
  changeProjectImage,
  changeProjectTitle,
  description,
  drag,
  id,
  image,
  isActive,
  onNavigate,
  title,
  triggerUpdate,
}: ProjectProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const { t } = useTranslation();
  const homeFolder = useAtomValue(HomeFolderStateAtom);
  const variant = useAtomValue(ThemeStateAtom);
  const setAllProjects = useSetAtom(ProjectsDataStateAtom);
  const setDisableAllNavigation = useSetAtom(DisableAllNavigationStateAtom);
  const [editingId, setEditingId] = useAtom(ItemEditStateAtom);

  const [imageToLoad, setImageToLoad] = useState<ImageURISource>(
    variant === 'default' ? PlaceholderImage : PlaceholderImageDark,
  );

  useEffect(() => {
    if (image && image.length > 0) {
      (async () => {
        try {
          const imageURI = `${homeFolder}/.scriptura/covers/${image}`;
          const __hasPermission = await hasPermission(imageURI);
          if (__hasPermission) {
            const base64String = await readFile(imageURI, {
              encoding: 'base64',
            });

            setImageToLoad({ uri: `data:image/png;base64,${base64String}` });
          }
        } catch (error) {
          print(error);
        }
      })();
    }
  }, [homeFolder, image]);

  const [tempImage, setTempImage] = useState<ImageURISource | null>(null);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const typewriterMode = useAtomValue(TypewriterModeStateAtom);
  const ICON_SIZE = 20;

  useEffect(() => {
    if (editingId.id.length !== 0 && editingId.id === id) {
      setDisableAllNavigation(true);
    } else {
      setDisableAllNavigation(false);
    }
  }, [editingId]);

  const changeImage = () => {
    (async () => {
      try {
        const result = await openDocument({
          multiple: false,
          persist: true,
        });
        const isValidImage = (file: DocumentFileDetail) => {
          const validMimeTypes = ['image/jpeg', 'image/png'];
          return file?.type === 'file' && validMimeTypes.includes(file.mime);
        };
        if (result?.length === 1 && isValidImage(result[0])) {
          setTempImage({ uri: result[0].uri });
          setEditingId({
            id,
            screen: 'projects-view',
            type: CHANGE_IMAGE_TYPE,
          });
        }
      } catch (error) {
        print(error);
      }
    })();
  };

  const menuItems: ContextMenuItem[] = [
    {
      color: colors.gray800,
      icon: (
        <FeatherIcons color={colors.gray800} name="edit-3" size={ICON_SIZE} />
      ),
      label: t('screen_projects.cards.edit_title'),
      onPress: () => {
        setEditingId({
          id,
          screen: 'projects-view',
          type: EDIT_TITLE_TYPE,
        });
      },
    },
    {
      color: colors.gray800,
      icon: (
        <FeatherIcons color={colors.gray800} name="edit" size={ICON_SIZE} />
      ),
      label: t('screen_projects.cards.edit_description'),
      onPress: () => {
        setEditingId({
          id,
          screen: 'projects-view',
          type: EDIT_DESCRIPTION_TYPE,
        });
      },
    },
    {
      color: colors.gray800,
      icon: (
        <SimpleLineIcons
          color={colors.gray800}
          name="picture"
          size={ICON_SIZE}
        />
      ),
      label: t('screen_projects.cards.change_image'),
      onPress: () => {
        changeImage();
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

  const handleDialogClick = (action: string, dialogType: string): void => {
    if (dialogType === 'save') {
      switch (action) {
        case CHANGE_IMAGE_TYPE: {
          if (tempImage?.uri) {
            setImageToLoad(tempImage);
            changeProjectImage(id, tempImage.uri);
          }
          break;
        }
        case EDIT_DESCRIPTION_TYPE: {
          changeProjectDescription(id, editedDescription);
          break;
        }
        case EDIT_TITLE_TYPE: {
          changeProjectTitle(id, editedTitle);
          break;
        }
        default:
          break;
      }
    }
    setEditingId({
      id: '',
      screen: '',
      type: '',
    });
    setTempImage(null);
  };

  const descriptionContent = description
    ? description
    : t('screen_projects.project_description_placeholder');

  const styles = StyleSheet.create({
    adornmentContainer: {
      borderRadius: 50,
      color: colors.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
      zIndex: 100_000,
    },
    adornmentContainerDescription: {
      backgroundColor:
        editedDescription.length < 80 ? colors.purple500 : colors.red500,
    },
    adornmentContainerTitle: {
      backgroundColor:
        editedTitle.length < 20 ? colors.purple500 : colors.red500,
    },
    elevatedBox: {
      backgroundColor: colors.purple100 + '4E',
      borderRadius: 10,
    },
    image: {
      borderRadius: 8,
      height: 160,
      width: 120,
    },
    inputDescriptionContainer: {
      backgroundColor: 'transparent',
      borderBottomColor: colors.purple500,
      borderBottomWidth: 1,
      height: 115,
      marginBottom: 11,
      width: 150,
    },
    inputDescriptionContent: {
      backgroundColor: 'transparent',
      height: 115,
      includeFontPadding: false,
      lineHeight: 24,
      paddingBottom: 1,
      paddingLeft: 0,
      paddingRight: 35,
      paddingTop: 1,
      textAlignVertical: 'center',
      zIndex: 999_999,
    },
    inputTitleContainer: {
      backgroundColor: 'transparent',
      borderBottomColor: colors.purple500,
      borderBottomWidth: 1,
      height: 24,
      marginBottom: 11,
      width: 180,
    },
    inputTitleContent: {
      backgroundColor: 'transparent',
      height: 24,
      includeFontPadding: false,
      lineHeight: 24,
      paddingBottom: 1,
      paddingLeft: 0,
      paddingRight: 15,
      paddingTop: 1,
      textAlignVertical: 'center',
    },
  });

  const destroyContent = async (shouldDestroy: boolean) => {
    if (shouldDestroy) {
      try {
        const allProjectsFromFile: Project[] = await getSupportFile(homeFolder);
        const selectedProject: Project | undefined = getProjectById(
          id,
          allProjectsFromFile,
        );
        if (selectedProject) {
          await unlink(selectedProject.androidFolderPath);
          setAllProjects(allProjectsFromFile.filter((item) => item.id !== id));

          Toast.show({
            text1: t('screen_projects.folder_deleted.text1'),
            text2: t('screen_projects.folder_deleted.text2'),
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

  return (
    <View style={[gutters.marginBottom_12, isActive && styles.elevatedBox]}>
      <CustomContextMenu
        backgroundColor={colors.full}
        id={id}
        menuItems={menuItems}
        menuTitle={title}
        menuTitleBackgroundColor={colors.purple100}
        onPress={() => onNavigate(id)}
      >
        <View style={layout.row}>
          <View>
            <Image
              resizeMode="cover"
              source={tempImage ?? imageToLoad}
              style={[styles.image]}
            />
            {editingId.id === id &&
              editingId.screen === 'projects-view' &&
              editingId.type === CHANGE_IMAGE_TYPE && (
                <ConfirmationDialog
                  dialogType={CHANGE_IMAGE_TYPE}
                  handleDialogClick={handleDialogClick}
                />
              )}
          </View>
          <View
            style={[
              layout.flex_1,
              layout.itemsStretch,
              gutters.paddingHorizontal_12,
            ]}
          >
            {editingId.id === id &&
            editingId.screen === 'projects-view' &&
            editingId.type === EDIT_TITLE_TYPE ? (
              <View style={styles.inputTitleContainer}>
                <TextInput
                  autoFocus
                  cursorColor={colors.purple500}
                  keyboardType="default"
                  maxLength={20}
                  onChangeText={setEditedTitle}
                  returnKeyType="default"
                  selectionColor={colors.gray200}
                  showSoftInputOnFocus={!typewriterMode}
                  style={[
                    fonts.defaultFontFamilyBold,
                    styles.inputTitleContent,
                    fonts.size_16,
                    fonts.gray800,
                    gutters.marginBottom_12,
                  ]}
                  value={editedTitle}
                />
                <ConfirmationDialog
                  dialogType={EDIT_TITLE_TYPE}
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
                    {editedTitle.length}/20
                  </Text>
                </ConfirmationDialog>
              </View>
            ) : (
              <Text
                style={[
                  fonts.defaultFontFamilyBold,
                  fonts.size_16,
                  fonts.gray800,
                  gutters.marginBottom_12,
                ]}
              >
                {title}
              </Text>
            )}
            {editingId.id === id &&
            editingId.screen === 'projects-view' &&
            editingId.type === EDIT_DESCRIPTION_TYPE ? (
              <View style={styles.inputDescriptionContainer}>
                <TextInput
                  autoFocus
                  cursorColor={colors.purple500}
                  keyboardType="default"
                  maxLength={80}
                  multiline
                  onChangeText={setEditedDescription}
                  returnKeyType="default"
                  selectionColor={colors.gray200}
                  showSoftInputOnFocus={!typewriterMode}
                  style={[
                    styles.inputDescriptionContent,
                    gutters.marginBottom_12,
                    fonts.defaultFontFamilyRegular,
                    fonts.gray800,
                    fonts.size_12,
                    fonts.lineGap,
                  ]}
                  value={editedDescription}
                />
                <ConfirmationDialog
                  dialogType={EDIT_DESCRIPTION_TYPE}
                  handleDialogClick={handleDialogClick}
                >
                  <Text
                    style={[
                      fonts.defaultFontFamilySemibold,
                      fonts.size_12,
                      styles.adornmentContainer,
                      styles.adornmentContainerDescription,
                    ]}
                  >
                    {editedDescription.length}/80
                  </Text>
                </ConfirmationDialog>
              </View>
            ) : (
              <Text
                numberOfLines={5}
                style={[
                  fonts.defaultFontFamilyRegular,
                  fonts.gray400,
                  fonts.size_12,
                  fonts.lineGap,
                ]}
              >
                {descriptionContent}
              </Text>
            )}
          </View>
          {
            editingId.id === '' && <View>
              <TouchableOpacity onLongPress={drag}>
                <Text>
                  <MaterialIcons color={colors.gray800} name="sort" size={30} />
                </Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </CustomContextMenu>
      <ContentDestroyer
        destroyContent={destroyContent}
        show={deleteDialog}
        title={`${truncateText(`${t('components.delete_project')} \"${title}`)}\"?`}
      />
    </View>
  );
}

export default ProjectCard;
