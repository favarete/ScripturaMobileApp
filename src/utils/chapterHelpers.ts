import markdownit from 'markdown-it';

export const getTitleFromChapterFile = (markdown: string) => {
  const match = markdown.match(/^# (.+)/m);
  return match ? match[1].trim() : null;
}

export const markdownToHtml = (markdown: string): string => {
  const md = markdownit()
  return md.render(markdown);
}

export const countWordsFromHTML = (markdownHTML: string): number => {
  const plainText = markdownHTML.replaceAll(/<[^>]*>/g, '');
  if (!plainText.trim()) {
    return 0;
  }
  const words = plainText.trim().split(/\s+/);
  return words.length;
}
