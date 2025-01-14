import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import ContextMenuView from 'react-native-context-menu-view';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';

type ProjectProps = {
  description: string;
  id: string;
  image: null | string;
  title: string;
};

const handleContextMenuPress = (action: string, title: string) => {
  switch (action) {
    case 'delete':
      Alert.alert('Delete Project', `Deleting: ${title}`);
      break;
    case 'edit':
      Alert.alert('Edit Project', `Editing: ${title}`);
      break;
    default:
      break;
  }
};

// const handleNavigate = (title: string) => {
//   //navigation.navigate('ProjectDetails', { project });
//   console.log(title);
// };

function ProjectCard({ description, id, image, title }: ProjectProps) {
  const { borders, fonts, gutters, layout } = useTheme();

  const imageToLoad = image ? { uri: image } : PlaceholderImage;
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  return (
    <ContextMenuView
      actions={[
        { systemIcon: 'pencil', title: 'Edit' },
        { destructive: true, systemIcon: 'trash', title: 'Delete' },
      ]}
      onPress={({ nativeEvent }) =>
        handleContextMenuPress(nativeEvent.name.toLowerCase(), title)
      }
      style={[gutters.marginBottom_12]}
      title={title}
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
          <Text
            style={[
              fonts.defaultFontFamilyBold,
              fonts.size_16,
              gutters.marginBottom_12,
            ]}
          >
            {title}
          </Text>
          <Text
            numberOfLines={5}
            style={[
              fonts.defaultFontFamilyRegular,
              fonts.gray400,
              fonts.size_12,
              fonts.lineGap,
            ]}
          >
            {description}
          </Text>
        </View>
      </View>

      <View style={[layout.row]}>
        <Image resizeMode="cover" source={imageToLoad} style={styles.image} />
        <View
          style={[
            layout.flex_1,
            layout.itemsStretch,
            gutters.paddingHorizontal_16,
          ]}
        >
          <TextInput
            onChangeText={setEditedTitle}
            style={[
              fonts.defaultFontFamilyBold,
              fonts.size_16,
              gutters.marginBottom_12,
              styles.inputTitle,
              borders.purple500
            ]}
            value={editedTitle}
          />
          <TextInput
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
