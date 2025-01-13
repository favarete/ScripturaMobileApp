import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ContextMenuView from 'react-native-context-menu-view';

import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';

type ProjectProps = {
  description: string;
  id: string;
  image: null | string;
  title: string;
};

const handleContextMenuPress  = (action: string, title: string) => {
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
  const imageToLoad = image ? { uri: image } : PlaceholderImage;

  return (
    <ContextMenuView
      actions={[
        { systemIcon: 'pencil', title: 'Edit' },
        { destructive: true, systemIcon: 'trash', title: 'Delete' },
      ]}
      onPress={({ nativeEvent }) =>
        handleContextMenuPress(nativeEvent.name.toLowerCase(), title)
      }
      style={styles.card}
      title={title}
    >
      <View style={styles.cardContent}>
        <Image resizeMode="cover" source={imageToLoad} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text numberOfLines={5} style={styles.description}>
            {description}
          </Text>
        </View>
      </View>
    </ContextMenuView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 16,
  },
  description: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  image: {
    borderRadius: 8,
    height: 160,
    width: 120,
  },
  textContainer: {
    flex: 1,
    padding: 8,
  },
  title: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProjectCard;
