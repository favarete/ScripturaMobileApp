import type { Project } from '@/state/defaults';

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
