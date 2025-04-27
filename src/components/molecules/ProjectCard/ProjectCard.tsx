import type { ImageURISource } from 'react-native';
import type { DocumentFileDetail } from 'react-native-saf-x';
import type { ContextMenuItem } from '@/components/atoms/CustomContextMenu/CustomContextMenu';
import type { Project } from '@/state/defaults';

import FeatherIcons from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
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
import { DisableAllNavigationStateAtom } from '@/state/atoms/temporaryContent';
import { getProjectById } from '@/utils/chapterHelpers';
import { print } from '@/utils/logger';
import { getSupportFile } from '@/utils/projectHelpers';

type ProjectProps = {
  changeProjectDescription: (projectId: string, newDescription: string) => void;
  changeProjectImage: (projectId: string, imagePath: string) => void;
  changeProjectTitle: (projectId: string, newTitle: string) => void;
  description: string;
  editingId: string;
  id: string;
  image: null | string;
  onNavigate: (id: string) => void;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
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
  editingId,
  id,
  image,
  onNavigate,
  setEditingId,
  title,
  triggerUpdate,
}: ProjectProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const { t } = useTranslation();
  const homeFolder = useAtomValue(HomeFolderStateAtom);
  const variant = useAtomValue(ThemeStateAtom);
  const setAllProjects = useSetAtom(ProjectsDataStateAtom);
  const setDisableAllNavigation = useSetAtom(DisableAllNavigationStateAtom);

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
  const [isEditing, setIsEditing] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const typewriterMode = useAtomValue(TypewriterModeStateAtom);
  const ICON_SIZE = 20;

  useEffect(() => {
    if (isEditing.length !== 0) {
      setDisableAllNavigation(true);
    } else {
      setDisableAllNavigation(false);
    }
  }, [isEditing]);

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
          setIsEditing(CHANGE_IMAGE_TYPE);
          setEditingId(id);
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
        setIsEditing(EDIT_TITLE_TYPE);
        setEditingId(id);
      },
    },
    {
      color: colors.gray800,
      icon: (
        <FeatherIcons color={colors.gray800} name="edit" size={ICON_SIZE} />
      ),
      label: t('screen_projects.cards.edit_description'),
      onPress: () => {
        setIsEditing(EDIT_DESCRIPTION_TYPE);
        setEditingId(id);
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
    setEditingId('');
    setIsEditing('');
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
    },
    adornmentContainerDescription: {
      backgroundColor:
        editedDescription.length < 130 ? colors.purple500 : colors.red500,
    },
    adornmentContainerTitle: {
      backgroundColor:
        editedTitle.length < 25 ? colors.purple500 : colors.red500,
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
    },
    inputDescriptionContent: {
      backgroundColor: 'transparent',
      height: 115,
      includeFontPadding: false,
      lineHeight: 24,
      paddingBottom: 1,
      paddingLeft: 0,
      paddingTop: 1,
      textAlignVertical: 'center',
    },
    inputTitleContainer: {
      backgroundColor: 'transparent',
      borderBottomColor: colors.purple500,
      borderBottomWidth: 1,
      height: 24,
      marginBottom: 11,
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
    sendToBackground: {
      opacity: 0.5,
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
    <View style={[gutters.marginBottom_12, editingStyle]}>
      <CustomContextMenu
        backgroundColor={colors.full}
        id={title}
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
              style={[
                styles.image,
                editingId.length === 0 ||
                (editingId === id && isEditing === CHANGE_IMAGE_TYPE)
                  ? styles.sendToForeground
                  : styles.sendToBackground,
              ]}
            />
            {isEditing === CHANGE_IMAGE_TYPE && (
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
              gutters.paddingHorizontal_16,
            ]}
          >
            {isEditing === EDIT_TITLE_TYPE ? (
              <View style={styles.inputTitleContainer}>
                <TextInput
                  autoFocus
                  cursorColor={colors.purple500}
                  keyboardType="default"
                  maxLength={25}
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
                    {editedTitle.length}/25
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
                  editingId.length === 0 ||
                  (editingId === id && isEditing === EDIT_TITLE_TYPE)
                    ? styles.sendToForeground
                    : styles.sendToBackground,
                ]}
              >
                {title}
              </Text>
            )}
            {isEditing === EDIT_DESCRIPTION_TYPE ? (
              <View style={styles.inputDescriptionContainer}>
                <TextInput
                  autoFocus
                  cursorColor={colors.purple500}
                  keyboardType="default"
                  maxLength={130}
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
                    {editedDescription.length}/130
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
                  editingId.length === 0 ||
                  (editingId === id && isEditing === EDIT_DESCRIPTION_TYPE)
                    ? styles.sendToForeground
                    : styles.sendToBackground,
                ]}
              >
                {descriptionContent}
              </Text>
            )}
          </View>
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
