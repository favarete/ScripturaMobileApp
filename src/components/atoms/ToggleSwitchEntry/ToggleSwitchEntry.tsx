import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

type Props = {
  getter: boolean;
  setter: (action: boolean) => void;
  title: string;
};

function ToggleSwitchEntry({ getter, setter, title }: Props) {
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const animValue = useSharedValue(getter ? 1 : 0);
  const toggleSwitch = () => {
    const newValue = !getter;
    animValue.value = withTiming(newValue ? 1 : 0, { duration: 300 });
    setter(newValue);
  };

  const styles = StyleSheet.create({
    itemContainer: {
      ...layout.itemsCenter,
      ...layout.row,
      ...layout.justifyBetween,
      ...gutters.marginVertical_8,
      ...gutters.marginHorizontal_16,
      ...gutters.padding_16,
      ...borders.rounded_4,
      backgroundColor: colors.full,
    },
    label: {
      ...fonts.defaultFontFamilyRegular,
      ...fonts.gray800,
      ...fonts.size_16,
    },
    switchContainer: {
      height: 26,
      width: 50,
      ...borders.rounded_16,
      ...gutters.padding_4,
      ...layout.justifyCenter,
    },
    switchOff: {
      backgroundColor: colors.gray200,
    },
    switchOn: {
      backgroundColor: colors.fullOpposite,
    },
    thumb: {
      backgroundColor: colors.full,
      borderRadius: 11,
      height: 22,
      position: 'absolute',
      width: 22,
    },
  });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (animValue.value + 0.1) * 24 }], // Move entre 0 e 20px
  }));

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity activeOpacity={0.8} onPress={toggleSwitch}>
        <View
          style={[
            styles.switchContainer,
            getter ? styles.switchOn : styles.switchOff,
          ]}
        >
          <Animated.View style={[styles.thumb, animatedThumbStyle]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default ToggleSwitchEntry;
