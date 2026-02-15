/**
 * Formula handling: detect formula for display.
 */

export function isFormula(value: unknown): boolean {
  if (value == null) return false
  const s = String(value).trim()
  return s.startsWith('=')
}
