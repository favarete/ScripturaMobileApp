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
  height?: number;
  numberOfTicks?: number;
  valueOnTop?: boolean;
  width?: number;
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  numberOfTicks = 5,
  valueOnTop = false,
  width = 300,
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
    <View style={{ height, width }}>
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id="barGradient" x1="0" x2="0" y1="1" y2="0">
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
                stroke={colors.gray100}
                strokeWidth={1}
                x1={margin - lineOffset}
                x2={margin + chartWidth + lineOffset}
                y1={y}
                y2={y}
              />

              <SvgText
                fill={colors.gray400}
                fontSize={10}
                textAnchor="end"
                x={margin - 10}
                y={y - 10}
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
                fill="url(#barGradient)"
                height={barHeight}
                width={barWidth}
                x={barX}
                y={barY}
              />
              <SvgText
                fill={colors.fullOpposite}
                fontSize={10}
                textAnchor="middle"
                x={barX + barWidth / 2}
                y={margin + chartHeight + 15}
              >
                {item.label}
              </SvgText>

              {valueOnTop && (
                <SvgText
                  fill={colors.fullOpposite}
                  fontSize={10}
                  textAnchor="middle"
                  x={barX + barWidth / 2}
                  y={barY - 5}
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
