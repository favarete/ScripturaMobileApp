import type { Variant } from '@/theme/types/config';

import { SupportedLanguages } from '@/hooks/language/schema';

const DEVICE_ONLY_STORAGE: string = 'device-only-settings';
const COMMON_STORAGE: string = 'common-information';

export const DEFAULT_STORAGE_VALUES = {
  commonStorage: COMMON_STORAGE,
  deviceOnlyStorage: DEVICE_ONLY_STORAGE,
};

const DEFAULT_THEME: Variant = 'default';
const DEFAULT_HOME_FOLDER: string = '';
const DEFAULT_LANGUAGE: SupportedLanguages = SupportedLanguages.EN_US;
const DEFAULT_TYPEWRITER_MODE: boolean = true;
const DEFAULT_FOCUSED_MODE: boolean = true;
const DEFAULT_AUTOSAVE_MODE: boolean = true;

export type DailyGoalMode = { enabled: boolean; target: number };
const DEFAULT_DAILY_GOAL_MODE: DailyGoalMode = {
  enabled: true,
  target: 500,
};

const DEFAULT_MAX_STREAK: number = 0;
const DEFAULT_CURRENT_STREAK: number = 0;

export type WordsWrittenTodayType = { date: number; value: number };
const DEFAULT_WORDS_WRITTEN_TODAY: WordsWrittenTodayType = {
  date: -1,
  value: 0,
};

export type ElementUUID = string;
const DEFAULT_FAVORITE_PROJECTS: ElementUUID[] = [];

export type DailyStats = {
  date: number;
  deletedWords: number;
  totalWords: number;
  writtenWords: number;
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

export type UsageStatsType = {
  averagePerDay: number;
  averagePerMonth: number;
  averagePerWeek: number;
  currentStreak: number;
  writingStreak: number;
};

export type DailyWordsStatsType = {
  date: number;
  totalWords: number;
};

const DEFAULT_USAGE_STATS: UsageStatsType = {
  averagePerDay: 0,
  averagePerMonth: 0,
  averagePerWeek: 0,
  currentStreak: 0,
  writingStreak: 0,
};

const DEFAULT_DAILY_WORDS_STATS: DailyWordsStatsType[] = [];
const DEFAULT_PROJECTS_SORT: ElementUUID[] = [];

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
  DraftReady = 'draft_ready',
  FirstRevisionDone = 'first_revision_done',
  InFirstRevision = 'in_first_revision',
  InProgress = 'in_progress',
  InSecondRevision = 'in_second_revision',
  InThirdRevision = 'in_third_revision',
  ManuscriptDone = 'manuscript_done',
  Planning = 'planning',
  SecondRevisionDone = 'second_revision_done',
  ThirdRevisionDone = 'third_revision_done',
  ToDo = 'to_do',
  Undefined = 'indeterminate',
}

const VALID_CHAPTER_STATUS = new Set<string>([
  ChapterStatusType.DraftReady,
  ChapterStatusType.FirstRevisionDone,
  ChapterStatusType.InFirstRevision,
  ChapterStatusType.InProgress,
  ChapterStatusType.InSecondRevision,
  ChapterStatusType.InThirdRevision,
  ChapterStatusType.ManuscriptDone,
  ChapterStatusType.Planning,
  ChapterStatusType.SecondRevisionDone,
  ChapterStatusType.ThirdRevisionDone,
  ChapterStatusType.ToDo,
]);

export const getValidChapterEnum = (value: string): ChapterStatusType => {
  if (VALID_CHAPTER_STATUS.has(value)) {
    return value as ChapterStatusType;
  }
  return ChapterStatusType.Undefined;
};

export type Chapter = {
  androidFilePath: string;
  id: ElementUUID;
  iphoneFilePath: string;
  lastUpdate: number;
  linuxFilePath: string;
  osxFilePath: string;
  revisionPosition: number;
  sentencesCount: number;
  status: ChapterStatusType;
  title: string;
  windowsFilePath: string;
  wordCount: number;
};

export type Project = {
  androidFolderPath: string;
  blurb: string;
  chapterLastViewed: string;
  chapters: Chapter[];
  chapterSort: ElementUUID[];
  coverPath: string;
  id: ElementUUID;
  iphoneFolderPath: string;
  lastUpdate: number;
  linuxFolderPath: string;
  osxFolderPath: string;
  sentencesCount: number;
  title: string;
  windowsFolderPath: string;
  wordCount: number;
};

export const initialProjectContent: Project = {
  androidFolderPath: '',
  blurb: '',
  chapterLastViewed: '',
  chapters: [],
  chapterSort: [],
  coverPath: '',
  id: '',
  iphoneFolderPath: '',
  lastUpdate: -1,
  linuxFolderPath: '',
  osxFolderPath: '',
  sentencesCount: -1,
  title: '',
  windowsFolderPath: '',
  wordCount: -1,
};

const DEFAULT_PROJECTS_DATA: Project[] = [];

export const DEFAULT_DATA = {
  autosaveMode: DEFAULT_AUTOSAVE_MODE,
  currentStreak: DEFAULT_CURRENT_STREAK,
  dailyGoalMode: DEFAULT_DAILY_GOAL_MODE,
  dailyWordsStats: DEFAULT_DAILY_WORDS_STATS,
  favoriteProjects: DEFAULT_FAVORITE_PROJECTS,
  focusedMode: DEFAULT_FOCUSED_MODE,
  homeFolder: DEFAULT_HOME_FOLDER,
  language: DEFAULT_LANGUAGE,
  maxStreak: DEFAULT_MAX_STREAK,
  projectsData: DEFAULT_PROJECTS_DATA,
  projectsSort: DEFAULT_PROJECTS_SORT,
  theme: DEFAULT_THEME,
  typewriterMode: DEFAULT_TYPEWRITER_MODE,
  usageStats: DEFAULT_USAGE_STATS,
  wordWrittenToday: DEFAULT_WORDS_WRITTEN_TODAY,
  writingStats: DEFAULT_WRITING_STATS
};
