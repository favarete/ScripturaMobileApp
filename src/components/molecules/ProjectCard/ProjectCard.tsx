import type { ImageURISource } from 'react-native';
import type { DocumentFileDetail } from 'react-native-saf-x';
import type { ContextMenuItem } from '@/components/atoms/CustomContextMenu/CustomContextMenu';

import FeatherIcons from '@react-native-vector-icons/feather';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { openDocument } from 'react-native-saf-x';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';

import ConfirmationDialog from '@/components/atoms/ConfirmationDialog/ConfirmationDialog';
import CustomContextMenu from '@/components/atoms/CustomContextMenu/CustomContextMenu';

import { print } from '@/utils/logger';

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
};

export const EDIT_TITLE_TYPE = 'edit-title';
export const EDIT_DESCRIPTION_TYPE = 'edit-description';
export const CHANGE_IMAGE_TYPE = 'change-image';

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
}: ProjectProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const { t } = useTranslation();

  const [imageToLoad, setImageToLoad] = useState<ImageURISource>(
    image ? { uri: image } : PlaceholderImage,
  );
  const [tempImage, setTempImage] = useState<ImageURISource | null>(null);
  const [isEditing, setIsEditing] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const ICON_SIZE = 20;

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
          // ImageSourcePropType Example:
          // {
          //   "size": 136507,
          //   "mime": "image/jpeg",
          //   "lastModified": 1738265118000,
          //   "name": "9781844137879_Heritage_Books_Banksy_Wall_and_Piece.jpg",
          //   "type": "file",
          //   "uri": "content://com.android.providers.downloads.documents/document/msf%3A1000000130"
          // }
          setTempImage({ uri: result[0].uri });
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
        setIsEditing(CHANGE_IMAGE_TYPE);
        setEditingId(id);
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

  return (
    <View style={[gutters.marginBottom_12, editingStyle]}>
      <CustomContextMenu
        backgroundColor={colors.full}
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
                  maxLength={25}
                  onChangeText={setEditedTitle}
                  style={[
                    fonts.defaultFontFamilyBold,
                    styles.inputTitleContent,
                    fonts.size_16,
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
                  maxLength={130}
                  multiline
                  onChangeText={setEditedDescription}
                  style={[
                    styles.inputDescriptionContent,
                    gutters.marginBottom_12,
                    fonts.defaultFontFamilyRegular,
                    fonts.gray400,
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
    </View>
  );
}

export default ProjectCard;
