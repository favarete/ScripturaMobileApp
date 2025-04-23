import type { DailyWordsStatsType, Project, UsageStatsType } from '@/state/defaults';
import { getNameAlias } from '@/utils/common';
import { readFile } from 'react-native-saf-x';

export const findProjectByTitleAndPath = (
  projects: Project[],
  title: string,
  androidFolderPath: string,
): null | Project => {
  return (
    projects.find(
      (project) =>
        project.title === title &&
        project.androidFolderPath === androidFolderPath,
    ) || null
  );
};

export const findProjectByTitle = (
  projects: Project[],
  title: string,
): null | Project => {
  return projects.find((project) => project.title === title) || null;
};

export const findProjectById = (
  projects: Project[],
  id: string,
): null | Project => {
  return projects.find((project) => project.id === id) || null;
};

export const projectListsAreEqual = (
  projectArr1: Project[],
  projectArr2: Project[],
): boolean => {
  if (projectArr1.length !== projectArr2.length) {
    return false;
  }

  if (projectArr1.length + projectArr2.length === 0) {
    return false;
  }

  const normalizeProject = (project: Project): string =>
    JSON.stringify(
      Object.keys(project)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (project as Record<string, unknown>)[key];
          return acc;
        }, {}),
    );

  const sorted1 = projectArr1
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(normalizeProject);
  const sorted2 = projectArr2
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(normalizeProject);

  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

export const calculateUsageStats = (data: DailyWordsStatsType[]): UsageStatsType => {
  if (!data || data.length === 0) {
    return {
      averagePerDay: 0,
      averagePerMonth: 0,
      averagePerWeek: 0,
      currentStreak: 0,
      writingStreak: 0,
    };
  }
  const totalDays = data.length;
  const sumWords = data.reduce((acc, day) => acc + day.totalWords, 0);

  const averagePerDay = sumWords / totalDays;
  const averagePerWeek = (sumWords / totalDays) * 7;
  const averagePerMonth = (sumWords / totalDays) * 30;

  let currentStreakCount = 0;
  let writingStreak = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].totalWords > 0) {
      currentStreakCount++;
      if (currentStreakCount > writingStreak) {
        writingStreak = currentStreakCount;
      }
    } else {
      currentStreakCount = 0;
    }
  }

  let currentStreak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].totalWords > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    averagePerDay,
    averagePerMonth,
    averagePerWeek,
    currentStreak,
    writingStreak,
  };
}

export const getSupportFile = async (homeFolder: string) => {
  const supportFile = getNameAlias(homeFolder);
  const allProjectsPersistedDataPath = `${homeFolder}/.scriptura/${supportFile}.json`;

  const allProjectsPersistedData: string = await readFile(
    allProjectsPersistedDataPath,
  );
  const allProjectsTemp: Project[] = JSON.parse(
    allProjectsPersistedData,
  );

  return allProjectsTemp
}
