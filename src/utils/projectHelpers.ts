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
