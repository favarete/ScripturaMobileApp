import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

type CircleProgressProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  progressColor?: string;
  backgroundColor?: string;
  textColor?: string;
  textSize?: number;
};

const CircleProgress: FC<CircleProgressProps> = ({
  progress,
  size = 110,
  strokeWidth = 15,
  progressColor = '#5ba65c',
  backgroundColor = '#a40d0d',
  textColor = '#050505',
  textSize = 14,
}) => {
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - circumference * progress;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
        <SvgText
          x={size / 2}
          y={size / 2 + textSize / 2.5}
          fill={textColor}
          fontSize={textSize}
          fontWeight="900"
          textAnchor="middle"
        >
          {`${Math.round(progress * 100)}%`}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircleProgress;
