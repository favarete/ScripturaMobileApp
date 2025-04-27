import type { RootStackParamList } from '@/navigation/types';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import {
  ChaptersView,
  ContentView,
  SettingsView,
  StatisticsView,
} from '@/screens';
import { ProjectsView } from '@/screens/index';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName={Paths.ProjectsView}
          key={variant}
          screenOptions={{
            detachPreviousScreen: true,
            headerShown: false,
          }}
        >
          <Stack.Screen
            component={ProjectsView}
            key={'ProjectsView-' + Date.now()}
            name={Paths.ProjectsView}
          />
          <Stack.Screen
            component={ChaptersView}
            key={'ChaptersView-' + Date.now()}
            name={Paths.ChaptersView}
          />
          <Stack.Screen
            component={ContentView}
            key={'ContentView-' + Date.now()}
            name={Paths.ContentView}
          />
          <Stack.Screen
            component={StatisticsView}
            key={'StatisticsView-' + Date.now()}
            name={Paths.StatisticsView}
          />
          <Stack.Screen
            component={SettingsView}
            key={'SettingsView-' + Date.now()}
            name={Paths.SettingsView}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
