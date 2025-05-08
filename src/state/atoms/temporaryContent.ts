import { atom } from 'jotai';

export const SelectedItemStateAtom = atom<string>('');

export type ItemEditStateAtomType = {
  id: string;
  screen: string;
  type: string;
};
export const ItemEditStateAtom = atom<ItemEditStateAtomType>({
  id: '',
  screen: '',
  type: '',
});

export const DisableAllNavigationStateAtom = atom<boolean>(false);
export const IsPortraitStateAtom = atom<boolean>(true);
