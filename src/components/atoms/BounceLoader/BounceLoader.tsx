import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useTheme } from '@/theme';

const BounceLoader = ({
  animationDuration = 600,
  bounceHeight = 16,
  color = '#333',
  dotCount = 3,
  dotSpacing = 8,
  size = 12,
  staggerDelay = 150,
}) => {
  const animatedValues = useRef(
    Array.from({ length: dotCount }).map(() => new Animated.Value(0)),
  ).current;

  const { gutters, layout } = useTheme();

  useEffect(() => {
    const createBounce = (value: Animated.Value) =>
      Animated.sequence([
        Animated.timing(value, {
          duration: animationDuration / 2,
          toValue: -bounceHeight,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          duration: animationDuration / 2,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]);

    const animations = animatedValues.map(createBounce);

    Animated.loop(Animated.stagger(staggerDelay, animations)).start();
  }, [animatedValues, bounceHeight, animationDuration, staggerDelay]);

  return (
    <View
      style={[
        layout.flex_1,
        gutters.marginVertical_32,
        layout.justifyCenter,
        layout.itemsCenter,
      ]}
    >
      <View style={[layout.row, layout.justifyCenter, layout.itemsCenter]}>
        {animatedValues.map((value, i) => (
          <Animated.View
            key={i}
            style={[
              {
                backgroundColor: color,
                borderRadius: size / 2,
                height: size,
                marginHorizontal: dotSpacing / 2,
                transform: [{ translateY: value }],
                width: size,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default BounceLoader;
