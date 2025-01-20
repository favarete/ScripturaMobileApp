import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ContextMenuView from 'react-native-context-menu-view';
import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import ConfirmationDialog from '@/components/atoms/ConfirmationDialog/ConfirmationDialog';

type ProjectProps = {
  description: string;
  editingId: string;
  id: string;
  image: null | string;
  onNavigate: (id: string) => void;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  title: string;
};

function ProjectCard({
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

  const imageToLoad = image ? { uri: image } : PlaceholderImage;
  const [isEditing, setIsEditing] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const EDIT_TITLE_TYPE = 'edit-title';
  const EDIT_DESCRIPTION_TYPE = 'edit-description';
  const CHANGE_IMAGE_TYPE = 'change-image';

  const handleContextMenuPress = (action: string, title: string) => {
    const actionId = action.toLowerCase().replaceAll(/\s+/g, '-');
    switch (actionId) {
      case CHANGE_IMAGE_TYPE: {
        setIsEditing(CHANGE_IMAGE_TYPE);
        console.log('Change Image.', `Project: ${title}`);
        break;
      }
      case EDIT_DESCRIPTION_TYPE: {
        setIsEditing(EDIT_DESCRIPTION_TYPE);
        setEditingId(id);
        break;
      }
      case EDIT_TITLE_TYPE: {
        setIsEditing(EDIT_TITLE_TYPE);
        setEditingId(id);
        break;
      }
      default: {
        setEditingId('');
        setIsEditing('');
        break;
      }
    }
  };

  const handleDialogClick = (dialogType: string, action: string): void => {
    switch (action) {
      case 'cancel': {
        setEditingId('');
        setIsEditing('');
        break;
      }
      default: {
        console.log(`Message from child: ${action} ${dialogType}`);
        break;
      }
    }
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

  return (
    <ContextMenuView
      actions={[
        { title: 'Edit Title' },
        { title: 'Edit Description' },
        { title: 'Change Image' },
      ]}
      disabled={Boolean(editingStyle)}
      onPress={({ nativeEvent }) =>
        handleContextMenuPress(nativeEvent.name, title)
      }
      style={[gutters.marginBottom_12, editingStyle]}
      title={title}
    >
      <TouchableOpacity
        activeOpacity={1.0}
        onLongPress={() => {}}
        onPress={() => onNavigate(id)}
      >
        <View style={[layout.row]}>
          <Image resizeMode="cover" source={imageToLoad} style={styles.image} />
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
      </TouchableOpacity>
    </ContextMenuView>
  );
}

export default ProjectCard;
