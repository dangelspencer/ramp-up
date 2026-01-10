/**
 * Formats a date as a relative time string.
 * Examples: "Today", "Yesterday", "2 days ago", "Jan 5"
 *
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Reset time parts for day comparison
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today.getTime() - dateDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // For older dates, show the actual date
  return formatShortDate(dateString);
}

/**
 * Formats a date in short format.
 * Example: "Jan 5" or "Jan 5, 2024" if different year
 *
 * @param dateString - ISO date string
 * @returns Short date string
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  if (date.getFullYear() !== now.getFullYear()) {
    return `${month} ${day}, ${date.getFullYear()}`;
  }

  return `${month} ${day}`;
}

/**
 * Formats a date in long format.
 * Example: "Monday, January 5, 2024"
 *
 * @param dateString - ISO date string
 * @returns Long date string
 */
export function formatLongDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Gets the day of week name.
 *
 * @param dayIndex - Day index (0 = Sunday, 1 = Monday, etc.)
 * @param short - Whether to return short name (default: false)
 * @returns Day name
 */
export function getDayName(dayIndex: number, short: boolean = false): string {
  const days = short
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return days[dayIndex % 7];
}

/**
 * Gets the week number of the year.
 *
 * @param date - Date object or ISO string
 * @returns Week number (1-52)
 */
export function getWeekNumber(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Checks if a date is within the current week.
 *
 * @param dateString - ISO date string
 * @returns True if date is in current week
 */
export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();

  // Get start of this week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get end of this week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Formats a date for display in workout history.
 * Shows relative time + day of week.
 * Example: "Today, Monday" or "Jan 5, Wednesday"
 *
 * @param dateString - ISO date string
 * @returns Formatted string
 */
export function formatWorkoutDate(dateString: string): string {
  const date = new Date(dateString);
  const relative = formatRelativeDate(dateString);
  const dayName = getDayName(date.getDay());

  if (relative === 'Today' || relative === 'Yesterday') {
    return `${relative}, ${dayName}`;
  }

  return `${formatShortDate(dateString)}, ${dayName}`;
}
