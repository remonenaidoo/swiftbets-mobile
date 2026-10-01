export function formatRand(minorUnits: number, currency = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(minorUnits / 100);
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/** "Starts in 4m" within the hour (the replay runs on a compressed clock); a day and time beyond that. */
export function formatKickoff(iso: string, now: number = Date.now()): string {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (minutes <= 0) {
    return 'Starting';
  }
  if (minutes < 60) {
    return `Starts in ${minutes}m`;
  }
  return new Date(iso).toLocaleString('en-ZA', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
}

/** A fresh idempotency key for one placement attempt (stable across retries of that attempt). */
export function newIdempotencyKey(): string {
  const random = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `web-${Date.now().toString(36)}-${random}`.slice(0, 64);
}
