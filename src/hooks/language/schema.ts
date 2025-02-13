import { z } from 'zod';

export const enum SupportedLanguages {
  EN_US = 'en-US',
  PT_BR = 'pt-BR',
}

export const languages = [
  { code: SupportedLanguages.EN_US, name: 'English' },
  { code: SupportedLanguages.PT_BR, name: 'Português' },
];

export const languageSchema = z.enum([
  SupportedLanguages.EN_US,
  SupportedLanguages.PT_BR,
]);

export type Language = z.infer<typeof languageSchema>;
