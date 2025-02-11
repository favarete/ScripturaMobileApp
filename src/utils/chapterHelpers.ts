import type React from 'react';
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
  const renderedMarkDown = markdownToHtml(markdownHTML);
  const plainText = renderedMarkDown.replaceAll(/<[^>]*>/g, '');
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

export const findChapterByTitleAndPath = (
  chapters: Chapter[],
  title: string,
  androidFolderPath: string,
): Chapter | null => {
  return (
    chapters.find(
      (chapter) =>
        chapter.title === title &&
        chapter.androidFilePath === androidFolderPath,
    ) || null
  );
};

export const formatNumber = (value: number, locales: string): string => {
  const _value = value <= 0 ? 0 : value;
  return new Intl.NumberFormat(locales).format(_value);
};

export const calculatePages = (
  wordCount: number,
  wordsPerPage: number = 450,
): number => {
  if (wordCount <= 0) {
    return 0;
  }
  return Math.ceil(wordCount / wordsPerPage);
};

export const calculatePercentage = (
  current: number,
  target: number,
): string => {
  if (target === 0) {
    return '-';
  }
  const percentage = (current / target) * 100;
  return `${Math.ceil(percentage)}%`;
};

type UpdateChapterValue = (
  setState: React.Dispatch<React.SetStateAction<Project[]>>,
  bookId: string,
  chapterId: string,
  newChapterValue: Partial<Chapter>,
) => void;

export const updateChapterValue: UpdateChapterValue = (
  setState,
  bookId,
  chapterId,
  newChapterValue,
) => {
  setState((prevState) =>
    prevState.map((book) =>
      book.id === bookId
        ? {
            ...book,
            chapters: book.chapters.map((chapter) =>
              chapter.id === chapterId
                ? { ...chapter, ...newChapterValue }
                : chapter,
            ),
          }
        : book,
    ),
  );
};
