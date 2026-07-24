const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export function isEmailLike(value) {
  const normalizedValue = String(value ?? '').trim();
  return normalizedValue.length > 0 && EMAIL_PATTERN.test(normalizedValue);
}

export function getSafePublicDisplayName(...candidates) {
  const displayName = candidates
    .map((candidate) => String(candidate ?? '').trim())
    .find((candidate) => candidate.length > 0 && !isEmailLike(candidate));

  return displayName || 'Hiker';
}
