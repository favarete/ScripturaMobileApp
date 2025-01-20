import type { ChapterStatusType } from '@/state/defaults';



import MaterialIcons from '@react-native-vector-icons/material-icons';
import SimpleLineIcons from '@react-native-vector-icons/simple-line-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ContextMenuView from 'react-native-context-menu-view';



import { useTheme } from '@/theme';





type ChapterProps = {
  editingId: string;
  id: string;
  lastUpdate: string;
  lastViewedId: string;
  onNavigate: (id: string) => void;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  status: ChapterStatusType;
  title: string;
  wordCount: number;
};

function ChapterCard({
  editingId,
  id,
  lastUpdate,
  lastViewedId,
  onNavigate,
  setEditingId,
  status,
  title,
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

  const handleContextMenuPress = (status: number, id: string) => {
    //const localizedStatuses = t('screen_chapters.status')
    const actionId = status.toLowerCase().replaceAll(/\s+/g, '-');
    console.log(`Chapter '${id}' to Change Status to '${status}'`);
  };

  return (
    <View
      style={[
        layout.row,
        layout.justifyBetween,
        gutters.marginHorizontal_32,
        gutters.marginVertical_12,
        styles.cardContent,
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
          <ContextMenuView
            actions={[
              { title: t('screen_chapters.status.indeterminate')},
              { title: t('screen_chapters.status.to_do') },
              { title: t('screen_chapters.status.in_progress') },
              { title: t('screen_chapters.status.draft_ready') },
              { title: t('screen_chapters.status.in_first_revision') },
              { title: t('screen_chapters.status.first_revision_done') },
              { title: t('screen_chapters.status.in_second_revision') },
              { title: t('screen_chapters.status.second_revision_done') },
              { title: t('screen_chapters.status.in_third_revision') },
              { title: t('screen_chapters.status.third_revision_done') },
              { title: t('screen_chapters.status.manuscript_done') },
            ]}
            disabled={Boolean(editingStyle)}
            onPress={({ nativeEvent }) =>
              handleContextMenuPress(nativeEvent.index, id)
            }
            style={[editingStyle]}
          >
            <TouchableOpacity
              activeOpacity={1.0}
              onLongPress={() => {}}
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
                <Text
                  style={[
                    fonts.defaultFontFamilyRegular,
                    fonts.gray800,
                    fonts.size_12,
                    styles.cardContent,
                  ]}
                >
                  <Text style={[fonts.defaultFontFamilyBold, fonts.purple500]}>
                    {t(`screen_chapters.status.${status}`) }
                  </Text>
                  <Text>{` | ${t('screen_chapters.word_count')}: ${wordCount}`}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          </ContextMenuView>
        </View>
      </View>
      <View>
        <TouchableOpacity onPress={handleSort}>
          <Text>
            <MaterialIcons color={colors.gray800} name='sort' size={30} />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ChapterCard;
