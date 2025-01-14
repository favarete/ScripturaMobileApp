import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { MMKV } from 'react-native-mmkv';

import {
  COMMON_STORAGE, DailyGoalMode, DEFAULT_DAILY_GOAL_MODE,
  DEFAULT_HOME_FOLDER,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_TYPEWRITER_MODE,
  DEVICE_ONLY_STORAGE
} from '@/state/defaults';

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

const DeviceOnlyStorage = new MMKV({ id: DEVICE_ONLY_STORAGE });
export const HomeFolderStateAtom = atomWithMMKV<string>(
  'home',
  DEFAULT_HOME_FOLDER,
  DeviceOnlyStorage,
);

export const ThemeStateAtom = atomWithMMKV<string>(
  'theme',
  DEFAULT_THEME,
  DeviceOnlyStorage,
);

export const LanguageStateAtom = atomWithMMKV<string>(
  'language',
  DEFAULT_LANGUAGE,
  DeviceOnlyStorage,
);

export const TypewriterModeStateAtom = atomWithMMKV<boolean>(
  'typewriter_mode',
  DEFAULT_TYPEWRITER_MODE,
  DeviceOnlyStorage,
);

// COMMON STORAGE
// export const CommonStorageStateAtom = atom((get) => {
//   const homeFolder = get(HomeFolderStateAtom);
//   if (homeFolder.length === 0) {
//     return `PASSO 1: ${homeFolder}`;
//   }
//   return `PASSO 2: ${homeFolder}`
// });


const CommonStorage = new MMKV({ id: COMMON_STORAGE });
export const DailyGoalModeStateAtom = atomWithMMKV<DailyGoalMode>(
  'daily_goal_mode',
  DEFAULT_DAILY_GOAL_MODE,
  CommonStorage,
);

// export const DailyGoalModeStateAtom = atom(
//   (get) => {
//     return get(HomeFolderStateAtom);
//   },
//   (get, set, dailyGoalData: DailyGoalMode) => {
//     const homeFolder = get(HomeFolderStateAtom);
//     set(HomeFolderStateAtom, homeFolder);
//   },
// );
