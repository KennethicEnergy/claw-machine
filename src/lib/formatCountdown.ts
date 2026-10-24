const MINUTE = 60 * 1000;

/** "7h 42m", "13m" or "less than a minute"; rounds up so it never runs out early. */
export const formatCountdown = (ms: number) => {
  if (ms < MINUTE) return "less than a minute";
  const totalMinutes = Math.ceil(ms / MINUTE);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};
