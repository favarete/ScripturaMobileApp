import type { PropsWithChildren } from 'react';
import type { ImageSourcePropType } from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

type ParallaxImageProps = PropsWithChildren<{
  parallaxImage: ImageSourcePropType;
  parallaxSubtitle: string;
  parallaxTitle: string;
}>;

const IMG_HEIGHT = 180;

function ParallaxImage({
  children = false,
  parallaxImage,
  parallaxSubtitle,
  parallaxTitle,
}: ParallaxImageProps) {
  const { colors, gutters } = useTheme();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  const styles = StyleSheet.create({
    image: {
      height: IMG_HEIGHT,
      resizeMode: 'cover',
      width: '100%',
    },
    imageContainer: {
      position: 'relative',
    },
    overlay: {
      alignItems: 'flex-start',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      bottom: 0,
      justifyContent: 'space-between',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    overlayText: {
      color: colors.full,
    },
  });

  return (
    <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
      <View style={styles.imageContainer}>
        <Animated.Image
          source={parallaxImage}
          style={[styles.image, imageAnimatedStyle]}
        />
        <View style={[styles.overlay, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}>
          <View>
            <Text>
              <Icon color={colors.full} name='arrow-back' size={30} />
            </Text>
          </View>
          <View style={[gutters.paddingLeft_24, gutters.paddingBottom_24]}>
            <Text
              style={[
                fonts.defaultFontFamilyBold,
                fonts.size_20,
                styles.overlayText,
              ]}
            >
              {parallaxTitle}
            </Text>
            <Text style={[fonts.defaultFontFamilySemibold, fonts.size_12, styles.overlayText]}>
              {parallaxSubtitle}
            </Text>
          </View>
        </View>
      </View>
      {children}
    </Animated.ScrollView>
  );
}

export default ParallaxImage;
