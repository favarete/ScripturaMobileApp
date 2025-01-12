import Toast from 'react-native-toast-message';

export const print = (
  content: string | unknown,
  publicMessage?: { text1: string; text2: string; type: string },
) => {
  if (__DEV__) {
    /* eslint-disable no-console */
    if (typeof content === 'string') {
      console.warn(content);
    } else if (content instanceof Error) {
      console.warn(content.message);
    }
    /* eslint-enable no-console */
  }

  if (
    publicMessage &&
    publicMessage.text1.length > 0 &&
    publicMessage.text2.length > 0
  ) {
    Toast.show({
      text1: publicMessage.text1,
      text2: publicMessage.text2,
      type: publicMessage.type,
    });
  }
};
