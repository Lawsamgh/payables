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
