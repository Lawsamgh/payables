/**
 * Format a count for compact display in overviews (1.2K, 15K, 1.2M).
 * Use for large numbers that can grow (Posted, Approved counts).
 */
export function formatCompactCount(value: number | null | undefined): string {
  if (value === null || value === undefined || value < 0) return "0";
  const n = Math.floor(value);
  if (n < 1_000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1_000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  const m = n / 1_000_000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}

/**
 * Format a number for display in the UI with thousand separators and 2 decimal places.
 * e.g. 2345.6 → "2,345.60", 0 → "0.00"
 */
export function formatNumberDisplay(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (Number.isNaN(n)) return ''
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
