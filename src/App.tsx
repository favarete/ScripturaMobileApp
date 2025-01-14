import 'react-native-gesture-handler';

import type { BaseToastProps } from 'react-native-toast-message';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { ThemeProvider } from '@/theme';
import ApplicationNavigator from '@/navigation/Application';

import '@/translations';

import type { JSX } from 'react';

import { SettingsProvider } from '@/state/SettingsProvider/SettingsProvider';

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
  return (
    <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <ThemeProvider>
              <ApplicationNavigator />
            </ThemeProvider>
          </SettingsProvider>
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
