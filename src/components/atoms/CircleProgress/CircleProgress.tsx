import type { FC } from 'react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

type CircleProgressProps = {
  backgroundColor?: string;
  progress: number;
  progressColor?: string;
  size?: number;
  strokeWidth?: number;
  textColor?: string;
  textSize?: number;
};

const CircleProgress: FC<CircleProgressProps> = ({
  backgroundColor = '#a40d0d',
  progress,
  progressColor = '#5ba65c',
  size = 110,
  strokeWidth = 15,
  textColor = '#050505',
  textSize = 14,
}) => {
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - circumference * progress;

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <Svg height={size} width={size}>
        <G originX={size / 2} originY={size / 2} rotation="-90">
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={progressColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </G>
        <SvgText
          fill={textColor}
          fontSize={textSize}
          fontWeight="900"
          textAnchor="middle"
          x={size / 2}
          y={size / 2 + textSize / 2.5}
        >
          {`${Math.round(progress * 100)}%`}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircleProgress;
