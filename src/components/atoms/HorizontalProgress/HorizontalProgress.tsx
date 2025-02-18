import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

export const HorizontalProgressBar: FC<{
  progress: number;
  width?: number;
  height?: number;
  fillColor?: string;
  backgroundColor?: string;
}> = ({
  progress,
  width = 200,
  height = 10,
  fillColor = '#5ba65c',
  backgroundColor = '#a40d0d',
}) => {
  const fillWidth = Math.max(0, Math.min(width * progress, width));

  return (
    <View
      style={[
        styles.progressBarBackground,
        {
          width,
          height,
          backgroundColor,
          borderRadius: height / 2,
        },
      ]}
    >
      <View
        style={[
          styles.progressBarFill,
          {
            width: fillWidth,
            height,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarBackground: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
