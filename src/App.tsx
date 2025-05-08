import 'react-native-gesture-handler';

import type { BaseToastProps } from 'react-native-toast-message';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { ThemeProvider } from '@/theme';
import ApplicationNavigator from '@/navigation/Application';

import '@/translations';

import type { JSX } from 'react';

import i18n from 'i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useLayoutEffect } from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';

import { LanguageStateAtom } from '@/state/atoms/persistentContent';
import { IsPortraitStateAtom } from '@/state/atoms/temporaryContent';

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

function App() {
  const language = useAtomValue(LanguageStateAtom);

  useEffect(() => {
    if (language && i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  const setIsPortrait = useSetAtom(IsPortraitStateAtom);

  const { height, width } = useWindowDimensions();

  useLayoutEffect(() => {
    setIsPortrait(height > width);
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsPortrait(window.height > window.width);
    });

    return () => subscription.remove();
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
