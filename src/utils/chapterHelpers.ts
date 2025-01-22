import type { Chapter, Project } from '@/state/defaults';

import markdownit from 'markdown-it';

export const getTitleFromChapterFile = (markdown: string) => {
  const md = markdownit();
  const tokens = md.parse(markdown, {});
  for (const token of tokens) {
    if (token.type === 'heading_open' && token.tag === 'h1') {
      const index = tokens.indexOf(token);
      const contentToken = tokens[index + 1];
      if (contentToken && contentToken.type === 'inline') {
        return contentToken.content.trim();
      }
    }
  }
  return null;
};

export const markdownToHtml = (markdown: string): string => {
  const md = markdownit();
  return md.render(markdown);
};

export const countWordsFromHTML = (markdownHTML: string): number => {
  const plainText = markdownHTML.replaceAll(/<[^>]*>/g, '');
  if (!plainText.trim()) {
    return 0;
  }
  const words = plainText.trim().split(/\s+/);
  return words.length;
};

export const getProjectById = (id: string, projects: Project[]) => {
  return projects.find((project) => project.id === id);
};

export const getChapterById = (
  id: string,
  chapterId: string,
  projects: Project[],
): Chapter | null => {
  const project = getProjectById(id, projects);
  if (project) {
    const chapter = project.chapters.find((ch) => ch.id === chapterId);
    if (chapter) {
      return chapter;
    }
  }
  return null;
};
