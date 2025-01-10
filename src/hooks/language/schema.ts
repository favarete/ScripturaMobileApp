import { z } from 'zod';

export const enum SupportedLanguages {
  EN_EN = 'en-EN',
  PT_BR = 'pt-BR',
}

export const languageSchema = z.enum([
  SupportedLanguages.EN_EN,
  SupportedLanguages.PT_BR,
]);

export type Language = z.infer<typeof languageSchema>;
