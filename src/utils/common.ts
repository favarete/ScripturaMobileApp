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


export const getWeekdayKey = (date: Date): keyof WritingStats => {
  const weekdays: { [key: number]: keyof WritingStats } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return weekdays[date.getDay()];
}
