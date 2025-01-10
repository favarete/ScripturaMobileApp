import type { StackScreenProps } from '@react-navigation/stack';
import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.ChaptersView]: undefined;
  [Paths.ContentView]: undefined;
  [Paths.Example]: undefined;
  [Paths.Home]: undefined;
  [Paths.ProjectsView]: undefined;
  [Paths.SettingsView]: undefined;
  [Paths.Startup]: undefined;
  [Paths.StatisticsView]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
