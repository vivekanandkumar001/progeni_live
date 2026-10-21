/**
 * Date formatting for registry timestamps.
 *
 * `createdAt` / `updatedAt` are calendar dates ("2026-10-15T00:00:00Z"), not
 * instants. Passing them straight to `new Date()` and then formatting in the
 * viewer's local time zone shifts the day for anyone west of UTC — a product
 * updated on the 15th shows as "Oct 14, 2026" in New York. These helpers
 * format the literal calendar date instead, so the date a user reads always
 * matches the date in the registry.
 */

/** Extracts the Y-M-D parts of an ISO timestamp without timezone maths. */
function parseCalendarDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

/**
 * Formats an ISO timestamp as a calendar date in `en-US`, immune to the
 * viewer's timezone. `options` accepts the usual `Intl.DateTimeFormatOptions`
 * (e.g. `{ month: 'short', day: 'numeric', year: 'numeric' }`).
 */
export function formatCalendarDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const parts = parseCalendarDate(iso);
  if (!parts) return iso;

  // Build the date in UTC and format it in UTC so no offset is ever applied.
  const date = new Date(Date.UTC(parts.year, parts.month, parts.day));
  return date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}
