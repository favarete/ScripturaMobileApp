import { atom } from 'jotai'
import type { DocumentFileDetail } from 'react-native-saf-x';

export const AllProjectsStateAtom = atom<DocumentFileDetail[]>([]);
