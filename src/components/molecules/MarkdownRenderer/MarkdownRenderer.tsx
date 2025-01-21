import markdownit from 'markdown-it';
import React from 'react';
import { Text, useWindowDimensions } from 'react-native';

import { useTheme } from '@/theme';

type MarkdownRendererProps = {
  markdown: string;
};

function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const { colors, fonts, gutters, layout } = useTheme();

  const markdownParser = markdownit();
  const htmlContent = markdownParser.render(markdown);

  const { width } = useWindowDimensions();
  return <Text>{htmlContent}</Text>;
}

export default MarkdownRenderer;
