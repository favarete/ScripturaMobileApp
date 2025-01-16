import uuid from 'react-native-uuid';

export const createNewUUID = () : string => {
  return uuid.v4();
}

export const formatTimestamp = (timestamp: number, locale: string) => {
  const date = new Date(Number(timestamp));
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}
