import type { Variant } from '@/theme/types/config';

import { SupportedLanguages } from '@/hooks/language/schema';

export const DEVICE_ONLY_STORAGE: string = 'device-only-settings';
export const COMMON_STORAGE: string = 'common-information';

export const DEFAULT_THEME: Variant = 'default';
export const DEFAULT_HOME_FOLDER: string = '';
export const DEFAULT_LANGUAGE: SupportedLanguages = SupportedLanguages.EN_EN;
export const DEFAULT_TYPEWRITER_MODE: boolean = true;

export type DailyGoalMode = { enabled: boolean; target: number };
export const DEFAULT_DAILY_GOAL_MODE: DailyGoalMode = {
  enabled: true,
  target: 500,
};

export const DEFAULT_MAX_STREAK: number = 0;
export const DEFAULT_CURRENT_STREAK: number = 0;
export const DEFAULT_WORDS_WRITTEN_TODAY: number = 0;

type ElementUUID = string;
export const DEFAULT_FAVORITE_PROJECTS: ElementUUID[] = [];

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

export const DEFAULT_WRITING_STATS: WritingStats = {
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
}

type Chapter = {
  filePath: string;
  id: ElementUUID;
  isLastViewed: boolean;
  revisionPosition: number;
  status: ChapterStatusType;
  title: string;
  wordCount: number;
};

type Project = {
  blurb: string;
  chapters: Chapter[];
  chapterSort: ElementUUID[];
  coverPath: string;
  folderPath: string;
  id: ElementUUID;
  lastUpdate: Date;
  title: string;
  wordCount: number;
};

export const DEFAULT_PROJECTS_DATA: Project[] = [];
