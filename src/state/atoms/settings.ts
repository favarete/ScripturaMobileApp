import { MMKV } from 'react-native-mmkv';
import { atom, DefaultValue } from 'recoil';

import { DEVICE_ONLY_STORAGE } from '@/state/constants';
import { print } from '@/utils/logger';
import type { DocumentFileDetail } from 'react-native-saf-x';

export const persistAtomForDeviceOnlyStorage =
  <T>(key: string) =>
  ({
    onSet,
    setSelf,
  }: {
    onSet: (
      callback: (
        newValue: T,
        oldValue: DefaultValue | T,
        isReset: boolean,
      ) => void,
    ) => void;
    setSelf: (callback: () => DefaultValue | T) => void;
  }) => {
    const deviceOnlyStorage = new MMKV({ id: DEVICE_ONLY_STORAGE });
    setSelf(() => {
      const data = deviceOnlyStorage.getString(key);
      if (data != null) {
        try {
          return JSON.parse(data) as T;
        } catch (error) {
          print(error);
          return new DefaultValue();
        }
      } else {
        return new DefaultValue();
      }
    });
    onSet((newValue, _, isReset) => {
      if (isReset) {
        deviceOnlyStorage.delete(key);
      } else {
        try {
          deviceOnlyStorage.set(key, JSON.stringify(newValue));
        } catch (error) {
          print(error);
        }
      }
    });
  };

export const HomeFolderStateAtom = atom<string>({
  default: '',
  effects: [persistAtomForDeviceOnlyStorage('home')],
  key: 'homeFolderStateAtom',
});

export const AllProjectsStateAtom = atom<DocumentFileDetail[]>({
  default: [],
  key: 'allProjectsStateAtom',
});
