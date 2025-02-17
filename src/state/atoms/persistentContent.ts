import type { SupportedLanguages } from '@/hooks/language/schema';
import type {
  DailyGoalMode,
  ElementUUID,
  Project,
  WritingStats,
} from '@/state/defaults';
import type { Variant } from '@/theme/types/config';

import { atomEffect } from 'jotai-effect';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { MMKV } from 'react-native-mmkv';
import { writeFile } from 'react-native-saf-x';

import { DEFAULT_DATA, DEFAULT_STORAGE_VALUES } from '@/state/defaults';
import { getNameAlias } from '@/utils/common';
import { print } from '@/utils/logger';

export const SaveAtomEffect = atomEffect((get) => {
  const allProjectsData = get(ProjectsDataStateAtom);

  const homeFolder = get.peek(HomeFolderStateAtom);
  if (!homeFolder) {
    return;
  }

  const supportFolder = `${homeFolder}/.scriptura`;
  const nameAlias = getNameAlias(homeFolder);

  if (nameAlias) {
    const projectsFile = `${supportFolder}/${nameAlias}.json`;
    try {
      const jsonString = JSON.stringify(allProjectsData, null, 2);
      void writeFile(projectsFile, jsonString);
    } catch (error) {
      print(error);
    }
  }
});

const atomWithMMKV = <T>(key: string, initialValue: T, storage: MMKV) =>
  atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => ({
      clearAll(): void {
        storage.clearAll();
      },
      getItem(key: string): null | string {
        const value = storage.getString(key);
        return value ? value : null;
      },
      removeItem(key: string): void {
        storage.delete(key);
      },
      setItem(key: string, value: string): void {
        storage.set(key, value);
      },
    })),
    {
      getOnInit: true,
    },
  );

// DEVICE ONLY STORAGE

const DeviceOnlyStorage = new MMKV({
  id: DEFAULT_STORAGE_VALUES.deviceOnlyStorage,
});

export const HomeFolderStateAtom = atomWithMMKV<string>(
  'home',
  DEFAULT_DATA.homeFolder,
  DeviceOnlyStorage,
);

export const ThemeStateAtom = atomWithMMKV<Variant>(
  'theme',
  DEFAULT_DATA.theme,
  DeviceOnlyStorage,
);

export const LanguageStateAtom = atomWithMMKV<SupportedLanguages>(
  'language',
  DEFAULT_DATA.language,
  DeviceOnlyStorage,
);

export const TypewriterModeStateAtom = atomWithMMKV<boolean>(
  'typewriter_mode',
  DEFAULT_DATA.typewriterMode,
  DeviceOnlyStorage,
);

export const AutosaveModeStateAtom = atomWithMMKV<boolean>(
  'autosave_mode',
  DEFAULT_DATA.autosaveMode,
  DeviceOnlyStorage,
);

// COMMON STORAGE
const CommonStorage = new MMKV({ id: DEFAULT_STORAGE_VALUES.commonStorage });
export const DailyGoalModeStateAtom = atomWithMMKV<DailyGoalMode>(
  'daily_goal_mode',
  DEFAULT_DATA.dailyGoalMode,
  CommonStorage,
);

export const MaxStreakStateAtom = atomWithMMKV<number>(
  'max_streak',
  DEFAULT_DATA.maxStreak,
  CommonStorage,
);

export const CurrentStreakStateAtom = atomWithMMKV<number>(
  'current_streak',
  DEFAULT_DATA.currentStreak,
  CommonStorage,
);

export const WordsWrittenTodayStateAtom = atomWithMMKV<number>(
  'words_written_today',
  DEFAULT_DATA.wordWrittenToday,
  CommonStorage,
);

export const FavoriteProjectsStateAtom = atomWithMMKV<ElementUUID[]>(
  'favorite_projects',
  DEFAULT_DATA.favoriteProjects,
  CommonStorage,
);

export const WritingStatsStateAtom = atomWithMMKV<WritingStats>(
  'writing_stats',
  DEFAULT_DATA.writingStats,
  CommonStorage,
);

export const ProjectsDataStateAtom = atomWithMMKV<Project[]>(
  'projects_data',
  DEFAULT_DATA.projectsData,
  CommonStorage,
);



