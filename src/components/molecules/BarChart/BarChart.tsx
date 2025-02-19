import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  Line,
  LinearGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { useTheme } from '@/theme';

type DataItem = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: DataItem[];
  width?: number;
  height?: number;
  numberOfTicks?: number;
  valueOnTop?: boolean;
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 300,
  height = 300,
  numberOfTicks = 5,
  valueOnTop = false,
}) => {
  const { colors } = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value));

  const margin = 40;
  const chartWidth = width - margin * 2;
  const chartHeight = height - margin * 2;

  const barSpacing = 10;
  const barWidth = (chartWidth - barSpacing * (data.length - 1)) / data.length;

  const stepValue = maxValue / numberOfTicks;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
            <Stop
              offset="0"
              stopColor={colors.fullOpposite}
              stopOpacity="0.95"
            />
            <Stop offset="1" stopColor={colors.gray200} stopOpacity="0.95" />
          </LinearGradient>
        </Defs>

        {Array.from({ length: numberOfTicks + 1 }).map((_, i) => {
          const yValue = stepValue * i;
          const y = chartHeight - (yValue / maxValue) * chartHeight + margin;

          const lineOffset = 20;
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={margin - lineOffset}
                x2={margin + chartWidth + lineOffset}
                y1={y}
                y2={y}
                stroke={colors.gray100}
                strokeWidth={1}
              />

              <SvgText
                x={margin - 10}
                y={y - 10}
                fontSize={10}
                fill={colors.gray400}
                textAnchor="end"
              >
                {Math.round(yValue)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {data.map((item, index) => {
          const barX = margin + index * (barWidth + barSpacing);
          const barHeight = (item.value / maxValue) * chartHeight;
          const barY = margin + (chartHeight - barHeight);

          return (
            <React.Fragment key={`bar-${index}`}>
              <Rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="url(#barGradient)"
              />
              <SvgText
                x={barX + barWidth / 2}
                y={margin + chartHeight + 15}
                fontSize={10}
                fill={colors.fullOpposite}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>

              {valueOnTop && (
                <SvgText
                  x={barX + barWidth / 2}
                  y={barY - 5}
                  fontSize={10}
                  fill={colors.fullOpposite}
                  textAnchor="middle"
                >
                  {item.value}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default BarChart;
