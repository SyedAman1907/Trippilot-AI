/**
 * Create URL-safe destination and place slugs
 */
export function createSlug(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format destination display name from slug or raw string
 */
export function formatDestinationName(slugOrName) {
  if (!slugOrName) return '';
  const decoded = decodeURIComponent(slugOrName).replace(/-/g, ' ');
  return decoded
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
