/**
 * Basic expression evaluator for amount fields.
 * Parses simple math expressions like "5000 + 250" or "10000 * 0.15" and returns the result.
 * Only allows numbers and operators (+, -, *, /, parentheses). Safe against code injection.
 */

const SAFE_CHARS = /^[\d.\s+\-*/()]+$/

/**
 * Evaluates a simple arithmetic expression. Returns the numeric result or null if invalid.
 * Examples: "5000 + 250" → 5250, "10000 * 0.15" → 1500
 */
export function evaluateSimpleExpression(value: string): number | null {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return null
  // Skip if it looks like a formula (starts with =) - handled elsewhere
  if (trimmed.startsWith('=')) return null
  const noSpaces = trimmed.replace(/\s/g, '')
  if (!SAFE_CHARS.test(noSpaces)) return null
  try {
    const result = Function(`"use strict"; return (${noSpaces})`)() as unknown
    const num = typeof result === 'number' && Number.isFinite(result) ? result : Number(result)
    return Number.isFinite(num) ? num : null
  } catch {
    return null
  }
}
