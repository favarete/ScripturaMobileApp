import 'react-native-gesture-handler';

import type { BaseToastProps } from 'react-native-toast-message';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import KeyEvent from 'react-native-keyevent';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { ThemeProvider } from '@/theme';
import ApplicationNavigator from '@/navigation/Application';

import '@/translations';

import type { JSX } from 'react';

import i18n from 'i18next';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

const getDigit = (keyCode: number): null | string => {
  if (keyCode >= 7 && keyCode <= 16) {
    return (keyCode - 7).toString();
  }
  return null;
};

const getLetter = (keyCode: number): null | string => {
  const codeToLetter = {
    29: 'A',
    30: 'B',
    31: 'C',
    32: 'D',
    33: 'E',
    34: 'F',
    35: 'G',
    36: 'H',
    37: 'I',
    38: 'J',
    39: 'K',
    40: 'L',
    41: 'M',
    42: 'N',
    43: 'O',
    44: 'P',
    45: 'Q',
    46: 'R',
    47: 'S',
    48: 'T',
    49: 'U',
    50: 'V',
    51: 'W',
    52: 'X',
    53: 'Y',
    54: 'Z',
  };
  return codeToLetter[keyCode as keyof typeof codeToLetter] || null;
};

function App() {
  const language = useAtomValue(LanguageStateAtom);

  useEffect(() => {
    if (language && i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  const [lastSequence, setLastSequence] = useState<null | string>(null);
  const [lastShortcut, setLastShortcut] = useState<null | string>(null);

  const buffer = useRef<string[]>([]);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const ctrlPressed = useRef<boolean>(false);

  const CTRL_LEFT = 113;
  const CTRL_RIGHT = 114;

  useEffect(() => {
    const onKeyDown = (event: { keyCode: number }) => {
      const { keyCode } = event;

      // Detects if Ctrl was pressed
      if (keyCode === CTRL_LEFT || keyCode === CTRL_RIGHT) {
        ctrlPressed.current = true;
        return;
      }

      if (!ctrlPressed.current) {
        return;
      }

      // Detect numbers with Ctrl (for a sequence)
      const digit = getDigit(keyCode);
      if (digit) {
        buffer.current.push(digit);
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
          const sequence = buffer.current.join('');
          if (sequence.length > 0) {
            console.log('Sequência com Ctrl:', sequence);
            setLastSequence(sequence);
          }
          buffer.current = [];
        }, 200);
        return;
      }

      // Detect letters with Ctrl (shortcuts)
      const letter = getLetter(keyCode);
      if (letter) {
        console.log('Atalho Ctrl +', letter);
        setLastShortcut(letter);
        // To do something with the letter (N → next, P → previous, etc.)
        return;
      }
    };

    const onKeyUp = (event: { keyCode: number }) => {
      if (event.keyCode === CTRL_LEFT || event.keyCode === CTRL_RIGHT) {
        ctrlPressed.current = false;
      }
    };

    KeyEvent.onKeyDownListener(onKeyDown);
    KeyEvent.onKeyUpListener(onKeyUp);

    return () => {
      KeyEvent.removeKeyDownListener();
      KeyEvent.removeKeyUpListener();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ApplicationNavigator />
        </ThemeProvider>
      </QueryClientProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}

export default App;

const toastConfig = {
  error: (props: BaseToastProps & JSX.IntrinsicAttributes) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#C13333' }}
      text1Style={{
        fontFamily: 'OpenSans-Bold',
        fontSize: 16,
      }}
      text2Style={{
        fontFamily: 'OpenSans-Regular',
        fontSize: 12,
      }}
    />
  ),
  success: (props: BaseToastProps & JSX.IntrinsicAttributes) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#A6A4F0' }}
      text1Style={{
        fontFamily: 'OpenSans-Bold',
        fontSize: 16,
      }}
      text2Style={{
        fontFamily: 'OpenSans-Regular',
        fontSize: 12,
      }}
    />
  ),
};
