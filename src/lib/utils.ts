import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Arabic, Arabic Supplement/Extended-A, and the presentation forms Urdu text
// is frequently encoded in.
const ARABIC_SCRIPT =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/

/**
 * Whether a string contains Urdu/Arabic script. Scraped content arrives in
 * mixed languages, and the `language` column is null for anything the pipeline
 * did not classify, so this reads the text itself rather than trusting a field.
 * Callers use it to apply `.urdu-text` / `.urdu-inline`, which give Nastaliq
 * the size and leading it needs (see globals.css).
 */
export function isArabicScript(text?: string | null): boolean {
  return !!text && ARABIC_SCRIPT.test(text)
}
