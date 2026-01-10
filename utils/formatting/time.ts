/**
 * Formats seconds into MM:SS format.
 *
 * @param totalSeconds - Total seconds to format
 * @returns Formatted string like "2:30" or "0:45"
 */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats seconds into a human-readable string.
 * Examples: "90 sec", "2 min", "2:30"
 *
 * @param totalSeconds - Total seconds to format
 * @returns Human-readable duration string
 */
export function formatRestTime(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return formatDuration(totalSeconds);
}

/**
 * Parses a time string (HH:MM) into hours and minutes.
 *
 * @param timeString - Time string in HH:MM format
 * @returns Object with hours and minutes
 */
export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

/**
 * Formats hours and minutes into HH:MM string.
 *
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Time string in HH:MM format
 */
export function formatTimeString(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats a time for display (12-hour format).
 *
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Formatted time like "6:00 PM"
 */
export function formatTimeDisplay(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Formats workout duration from start and end timestamps.
 *
 * @param startedAt - ISO timestamp of workout start
 * @param completedAt - ISO timestamp of workout completion
 * @returns Formatted duration string
 */
export function formatWorkoutDuration(
  startedAt: string,
  completedAt: string
): string {
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const durationMs = end.getTime() - start.getTime();
  const totalMinutes = Math.floor(durationMs / 60000);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}
