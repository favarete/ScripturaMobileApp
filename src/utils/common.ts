import markdownit from 'markdown-it';
import uuid from 'react-native-uuid';

import type { DailyStats, WritingStats } from '@/state/defaults';

export const createNewUUID = (): string => {
  return uuid.v4();
};

export const getNameAlias = (fullUri: string) => {
  const finalSection = fullUri.split(':').pop();
  return finalSection ? finalSection.replace('/', '_') : '';
};

export const updateLastSegment = (path: string, newSegment: string): string => {
  const lastSlashIndex = path.lastIndexOf('/');
  if (lastSlashIndex === -1) {
    return path;
  }
  return path.slice(0, Math.max(0, lastSlashIndex + 1)) + newSegment;
};

export const formatTimestamp = (timestamp: number, locale: string) => {
  const date = new Date(Number(timestamp));
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (
  timestamp: number,
  locale: string,
): { content: string; isToday: boolean } => {
  const inputDate = new Date(timestamp);
  const today = new Date();

  const isToday =
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate();

  return isToday
    ? {
        content: inputDate.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isToday: true,
      }
    : {
        content: inputDate.toLocaleDateString(locale),
        isToday: false,
      };
};

export const arraysAreEqualAndNonEmpty = (arr1: string[], arr2: string[]) => {
  if (arr1.length === 0 || arr2.length === 0) {
    return false;
  }
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export const removeFileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex !== -1 ? fileName.slice(0, Math.max(0, dotIndex)) : fileName;
};

export const getWeekdayKey = (timestamp: number): keyof WritingStats => {
  const weekdays: { [key: number]: keyof WritingStats } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const date = new Date(timestamp);
  return weekdays[date.getDay()];
};

export const getDateOnlyFromTimestamp = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const countOccurrences = (text: string): Record<string, number> => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
};

export const compareWordFrequencies = (
  oldFrequencies: Record<string, number>,
  newFrequencies: Record<string, number>,
): { totalAdded: number; totalRemoved: number } => {
  let totalAdded = 0;
  let totalRemoved = 0;
  const allWords = new Set([
    ...Object.keys(newFrequencies),
    ...Object.keys(oldFrequencies),
  ]);

  allWords.forEach((word) => {
    const oldCount = oldFrequencies[word] || 0;
    const newCount = newFrequencies[word] || 0;

    if (newCount > oldCount) {
      totalAdded += newCount - oldCount;
    } else if (oldCount > newCount) {
      totalRemoved += oldCount - newCount;
    }
  });

  return { totalAdded, totalRemoved };
};

export const calculatePercentageGoal = (
  currentValue: number,
  targetValue: number,
): number => {

  const progress = Math.min(1, Math.max(0, currentValue / targetValue));
  return Number.parseFloat(progress.toFixed(2));
}

export const getAverageWrittenWords = (stats: DailyStats[]): number => {
  if (stats.length === 0) {return 0;}
  const total = stats.reduce((sum, stat) => sum + stat.writtenWords, 0);
  return total / stats.length;
};

// const isPunctuation = (char: string): boolean => {
//   const punctuationMarks = new Set([',', ';', ':', '!', '?', '.', "'", '"']);
//   return punctuationMarks.has(char);
// };
//
// const isSpace = (char: string): boolean => {
//   const spaces = new Set([' ', '\t']);
//   return spaces.has(char);
// };
//
// const isLineBreak = (char: string): boolean => {
//   const lineBreaks = new Set(['\n', '\r']);
//   return lineBreaks.has(char);
// };
//
// const isLetterOrNumber = (char: string): boolean => {
//   const codePoint = char.codePointAt(0); // Get the Unicode code point
//   if (!codePoint) {
//     return false; // Invalid character
//   }
//   // Check if it's a number (0-9)
//   if (codePoint >= 48 && codePoint <= 57) {
//     return true;
//   }
//   // Check if it's a letter in the Unicode range
//   const letterRegex = /^\p{L}$/u;
//   return letterRegex.test(char);
// };


export const minimizeMarkdownText = (markdownText: string): string => {
  const md = markdownit();
  const renderedMarkDown = md.render(markdownText);

  const plainText = renderedMarkDown.replaceAll(/<[^>]*>/g, '');
  if (!plainText.trim()) {
    return '';
  }

  let wordsOnlyText = plainText.replaceAll(/[^\p{L}\p{N}\s]/gu, '');
  wordsOnlyText = wordsOnlyText.replaceAll(/\s+/g, ' ');
  return wordsOnlyText.trim();
};

export const minimizeMarkdownTextLength = (markdownText: string): number => {
  const wordsOnlyText = minimizeMarkdownText(markdownText);
  return wordsOnlyText.split(/\s+/).filter((word) => word.length > 0).length;
};
