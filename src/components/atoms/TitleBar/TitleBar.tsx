import FeatherIcons from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  onNavigateBack?: (() => void) | false;
  onToggleView?: (() => void) | false;
  title: string;
  viewMode?: boolean;
};

function TitleBar({
  onNavigateBack = false,
  onToggleView = false,
  title,
  viewMode = false,
}: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const extraElements = onToggleView && onNavigateBack;
  const ICON_SIZE = 25;
  const styles = StyleSheet.create({
    container: {
      height: 52,
    },
  });
  return (
    <View
      style={[
        backgrounds.gray50,
        layout.justifyBetween,
        layout.itemsCenter,
        layout.row,
        extraElements ? layout.justifyBetween : layout.justifyCenter,
        gutters.padding_12,
        styles.container,
      ]}
    >
      {extraElements && (
        <View>
          <TouchableOpacity onPress={onNavigateBack}>
            <Text>
              <MaterialIcons
                color={colors.fullOpposite}
                name="arrow-back"
                size={ICON_SIZE}
              />
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text
        style={[fonts.defaultFontFamilyBold, fonts.fullOpposite, fonts.size_16]}
      >
        {title}
      </Text>
      {extraElements && (
        <View>
          <TouchableOpacity onPress={onToggleView}>
            <Text>
              <FeatherIcons
                color={colors.fullOpposite}
                name={viewMode ? 'edit' : 'eye'}
                size={ICON_SIZE}
              />
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default TitleBar;
