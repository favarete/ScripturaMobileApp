import uuid from 'react-native-uuid';
import { WritingStats } from '@/state/defaults';

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

export const countOccurrences = (words: string[]): Record<string, number> => {
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number> );
}

export const extractCompleteWords = (text: string): string[] => {
  const trimmed = text.trimEnd();
  const tokens = trimmed.match(/\S+/g) || [];

  const endsWithSpace = text.endsWith(' ');

  if (!endsWithSpace && tokens.length > 0) {
    tokens.pop();
  }

  return tokens;
}
