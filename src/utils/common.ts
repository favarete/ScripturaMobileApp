import uuid from 'react-native-uuid';

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
    year: 'numeric'
  }).format(date);
};
