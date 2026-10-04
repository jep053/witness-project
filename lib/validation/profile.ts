export const DISPLAY_NAME_MAX = 50
export const BIO_MAX = 160

/** Trim; empty string becomes null so the column stays NULL, not ''. */
export function normalizeOptional(raw: string): string | null {
  const trimmed = raw.trim()
  return trimmed === '' ? null : trimmed
}

export function validateProfile(displayName: string | null, bio: string | null): string | null {
  if (displayName && displayName.length > DISPLAY_NAME_MAX) {
    return `Name can be at most ${DISPLAY_NAME_MAX} characters.`
  }
  if (bio && bio.length > BIO_MAX) {
    return `Bio can be at most ${BIO_MAX} characters.`
  }
  return null
}