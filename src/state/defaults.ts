import type { Variant } from '@/theme/types/config';

import { SupportedLanguages } from '@/hooks/language/schema';

const DEVICE_ONLY_STORAGE: string = 'device-only-settings';
const COMMON_STORAGE: string = 'common-information';

export const DEFAULT_STORAGE_VALUES = {
  commonStorage: COMMON_STORAGE,
  deviceOnlyStorage: DEVICE_ONLY_STORAGE,
}

const DEFAULT_THEME: Variant = 'default';
const DEFAULT_HOME_FOLDER: string = '';
const DEFAULT_LANGUAGE: SupportedLanguages = SupportedLanguages.EN_US;
const DEFAULT_TYPEWRITER_MODE: boolean = true;

export type DailyGoalMode = { enabled: boolean; target: number };
const DEFAULT_DAILY_GOAL_MODE: DailyGoalMode = {
  enabled: true,
  target: 500,
};

const DEFAULT_MAX_STREAK: number = 0;
const DEFAULT_CURRENT_STREAK: number = 0;
const DEFAULT_WORDS_WRITTEN_TODAY: number = 0;

export type ElementUUID = string;
const DEFAULT_FAVORITE_PROJECTS: ElementUUID[] = [];

type DailyStats = {
  date: Date;
  words: number;
};

export type WritingStats = {
  friday: DailyStats[];
  monday: DailyStats[];
  saturday: DailyStats[];
  sunday: DailyStats[];
  thursday: DailyStats[];
  tuesday: DailyStats[];
  wednesday: DailyStats[];
};

const DEFAULT_WRITING_STATS: WritingStats = {
  friday: [],
  monday: [],
  saturday: [],
  sunday: [],
  thursday: [],
  tuesday: [],
  wednesday: [],
};

export const enum ChapterStatusType {
  DraftReady = 3,
  FirstRevisionDone = 5,
  InFirstRevision = 4,
  InProgress = 2,
  InSecondRevision = 6,
  InThirdRevision = 8,
  ManuscriptDone = 10,
  Planning = 1,
  SecondRevisionDone = 7,
  ThirdRevisionDone = 9,
  ToDo = 0,
  Undefined = -1,
}

export type Chapter = {
  androidFilePath: string;
  id: ElementUUID;
  iphoneFilePath: string;
  isLastViewed: boolean;
  linuxFilePath: string;
  osxFilePath: string;
  revisionPosition: number;
  status: ChapterStatusType;
  title: string;
  windowsFilePath: string;
  wordCount: number;
};

export type Project = {
  androidFolderPath: string;
  blurb: string;
  chapters: Chapter[];
  chapterSort: ElementUUID[];
  coverPath: string;
  id: ElementUUID;
  iphoneFolderPath: string;
  lastUpdate: string;
  linuxFolderPath: string;
  osxFolderPath: string;
  title: string;
  windowsFolderPath: string;
  wordCount: number;
};

export const initialProjectContent: Project = {
  androidFolderPath: '',
  blurb: '',
  chapters: [],
  chapterSort: [],
  coverPath: '',
  id: '',
  iphoneFolderPath: '',
  lastUpdate: '',
  linuxFolderPath: '',
  osxFolderPath: '',
  title: '',
  windowsFolderPath: '',
  wordCount: -1,
}

const DEFAULT_PROJECTS_DATA: Project[] = [];

export const DEFAULT_DATA = {
  currentStreak: DEFAULT_CURRENT_STREAK,
  dailyGoalMode: DEFAULT_DAILY_GOAL_MODE,
  favoriteProjects: DEFAULT_FAVORITE_PROJECTS,
  homeFolder: DEFAULT_HOME_FOLDER,
  language: DEFAULT_LANGUAGE,
  maxStreak: DEFAULT_MAX_STREAK,
  projectsData: DEFAULT_PROJECTS_DATA,
  theme: DEFAULT_THEME,
  typewriterMode: DEFAULT_TYPEWRITER_MODE,
  wordWrittenToday: DEFAULT_WORDS_WRITTEN_TODAY,
  writingStats: DEFAULT_WRITING_STATS
}
