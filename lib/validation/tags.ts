export const TAG_MAX_LENGTH = 30
export const MAX_TAGS_PER_POST = 5

// Hangul Compatibility Jamo (ㄱ-ㅎ, ㅏ-ㅣ). A finished syllable lives in a
// different block, so any match here is a lone consonant/vowel — either junk
// like "ㅋㅋ" or an IME composition that never finished ("운ㄷ").
const LONE_JAMO = /[\u3130-\u318F]/
const ALLOWED = /^[\p{L}\p{N}_\- ]+$/u

/** Trim, strip leading '#', collapse spaces, lowercase. */
export function normalizeTagName(raw: string): string {
  return raw.trim().replace(/^#+/, '').trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Returns an error message, or null if the (normalized) name is valid. */
export function validateTagName(name: string): string | null {
  if (!name) return 'Tag cannot be empty.'
  if (name.length > TAG_MAX_LENGTH) return `Tags can be at most ${TAG_MAX_LENGTH} characters.`
  if (LONE_JAMO.test(name)) return 'Please finish typing the tag (lone consonants/vowels are not allowed).'
  if (!ALLOWED.test(name)) return 'Tags can only contain letters, numbers, spaces, - and _.'
  return null
}