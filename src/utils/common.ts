import uuid from 'react-native-uuid';
import { WritingStats } from '@/state/defaults';
import markdownit from 'markdown-it';

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
}

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
}

export const getDateOnlyFromTimestamp = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export const countOccurrences = (text: string): Record<string, number> => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number> );
}

export const compareWordFrequencies = (
  oldFrequencies: Record<string, number>,
  newFrequencies: Record<string, number>
): { totalAdded: number; totalRemoved: number } => {
  let totalAdded = 0;
  let totalRemoved = 0;
  const allWords = new Set([...Object.keys(oldFrequencies), ...Object.keys(newFrequencies)]);

  allWords.forEach(word => {
    const oldCount = oldFrequencies[word] || 0;
    const newCount = newFrequencies[word] || 0;

    if (newCount > oldCount) {
      totalAdded += newCount - oldCount;
    } else if (oldCount > newCount) {
      totalRemoved += oldCount - newCount;
    }
  });

  return { totalAdded, totalRemoved };
}

export const isPunctuationOrSpaceOrLineBreak = (char: string): boolean => {
  const punctuationMarks = new Set([',', ';', ':', '!', '?', '.', '\'', '"']);
  const lineBreaks = new Set(['\n', '\r']);
  const spaces = new Set([' ', '\t']);

  return punctuationMarks.has(char) || lineBreaks.has(char) || spaces.has(char);
};

// export const settledForWordEvaluation = (text: string, cursorPos: number) => {
//   const charBefore = isPunctuationOrSpaceOrLineBreak(text[cursorPos - 1] ?? '');
//   const charAfter = isPunctuationOrSpaceOrLineBreak(text[cursorPos] ?? '');
//
//   return true
// }

export const minimizeMarkdownText = (markdownText: string): string => {
  const md = markdownit();
  const renderedMarkDown = md.render(markdownText);

  const plainText = renderedMarkDown.replaceAll(/<[^>]*>/g, '');
  if (!plainText.trim()) {
    return '';
  }

  let wordsOnlyText = plainText.replace(/[^\p{L}\p{N}\s]/gu, '');
  wordsOnlyText = wordsOnlyText.replace(/\s+/g, ' ');
  return wordsOnlyText.trim();
}

export const minimizeMarkdownTextLength = (markdownText: string): number => {
  const wordsOnlyText = minimizeMarkdownText(markdownText);
  return wordsOnlyText.split(/\s+/).filter(word => word.length > 0).length;
}
