import type { StackScreenProps } from '@react-navigation/stack';
import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.ChaptersView]: {projectId: string};
  [Paths.ContentView]: {chapterId: string, projectId: string};
  [Paths.Example]: undefined;
  [Paths.Home]: undefined;
  [Paths.ProjectsView]: undefined;
  [Paths.SettingsView]: {chapterId: string, projectId: string};
  [Paths.Startup]: undefined;
  [Paths.StatisticsView]: {chapterId: string, projectId: string};
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
