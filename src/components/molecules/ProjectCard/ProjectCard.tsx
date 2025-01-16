import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import ContextMenuView from 'react-native-context-menu-view';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import ConfirmationDialog from '@/components/atoms/ConfirmationDialog/ConfirmationDialog';

type ProjectProps = {
  description: string;
  id: string;
  image: null | string;
  title: string;
};

// const handleNavigate = (title: string) => {
//   //navigation.navigate('ProjectDetails', { project });
//   console.log(title);
// };

function ProjectCard({ description, id, image, title }: ProjectProps) {
  const { borders, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const imageToLoad = image ? { uri: image } : PlaceholderImage;
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const EDIT_TITLE_TYPE = 'edit-title';
  const [isEditing, setIsEditing] = useState<string>(EDIT_TITLE_TYPE);

  const handleContextMenuPress = (action: string, title: string) => {
    const actionId = action.toLowerCase().replaceAll(/\s+/g, '-');
    switch (actionId) {
      case 'change-image':
        Alert.alert('Change Image.', `Project: ${title}`);
        break;
      case 'edit-description':
        Alert.alert('Edit Description.', `Project: ${title}`);
        break;
      case 'edit-title':
        Alert.alert('Edit Title', `Project: ${title}`);
        break;
      default:
        //setIsEditing('');
        break;
    }
  };

  const handleDialogClick = (dialogType: string, action: string): void => {
    console.log(`Message from child: ${action} ${dialogType}`);
  };

  const descriptionContent = description
    ? description
    : t('screen_projects.project_description_placeholder');

  return (
    <ContextMenuView
      actions={[
        { title: 'Edit Title' },
        { title: 'Edit Description' },
        { title: 'Change Image' },
      ]}
      onPress={({ nativeEvent }) =>
        handleContextMenuPress(nativeEvent.name, title)
      }
      style={[gutters.marginBottom_12]}
      title={title}
    >
      <View style={[layout.row]}>
        <Image resizeMode='cover' source={imageToLoad} style={styles.image} />
        <View
          style={[
            layout.flex_1,
            layout.itemsStretch,
            gutters.paddingHorizontal_16,
          ]}
        >
          {isEditing === EDIT_TITLE_TYPE ? (
            <View>
            <TextInput
              maxLength={25}
              onChangeText={setEditedTitle}
              style={[
                fonts.defaultFontFamilyBold,
                fonts.size_16,
                gutters.marginBottom_12,
                styles.inputTitle,
                borders.purple500,
              ]}
              value={editedTitle}
            />
              <ConfirmationDialog dialogType={EDIT_TITLE_TYPE} handleDialogClick={handleDialogClick} />
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
          {isEditing === 'edit-description' ? (
            <TextInput
              maxLength={160}
              multiline
              onChangeText={setEditedDescription}
              style={[
                fonts.defaultFontFamilyRegular,
                fonts.gray400,
                fonts.size_12,
                fonts.lineGap,
                styles.inputDescription,
              ]}
              value={editedDescription}
            />
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
      </View>
    </ContextMenuView>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    height: 160,
    width: 120,
  },
  inputDescription: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    height: 120,
    includeFontPadding: false,
    lineHeight: 24,
    margin: 0,
    padding: 0,
    textAlignVertical: 'center',
  },
  inputTitle: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    height: 24,
    includeFontPadding: false,
    lineHeight: 24,
    margin: 0,
    padding: 0,
    textAlignVertical: 'center',
  },
});

export default ProjectCard;
