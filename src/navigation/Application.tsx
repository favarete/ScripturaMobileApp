import type { RootStackParamList } from '@/navigation/types';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import { ChaptersView, ContentView, Home, SettingsView, Startup, StatisticsView } from '@/screens';
import ProjectsView from '@/screens/ProjectsView/ProjectsView';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant} screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen component={Startup} name={Paths.Startup} />
          <Stack.Screen component={Home} name={Paths.Home} />
          <Stack.Screen component={ProjectsView} name={Paths.ProjectsView} />
          <Stack.Screen component={ChaptersView} name={Paths.ChaptersView} />
          <Stack.Screen component={ContentView} name={Paths.ContentView} />
          <Stack.Screen
            component={StatisticsView}
            name={Paths.StatisticsView}
          />
          <Stack.Screen component={SettingsView} name={Paths.SettingsView} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
