/**
 * Convert a number to words for display (e.g. "One thousand two hundred thirty-four and 56/100").
 */

const ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function capitalize(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

function hundreds(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  if (n < 100) {
    const t = Math.floor(n / 10)
    const o = n % 10
    return (TENS[t] + (o > 0 ? '-' + ONES[o] : '')).trim()
  }
  const h = Math.floor(n / 100)
  const r = n % 100
  const rest = r > 0 ? ' ' + hundreds(r) : ''
  return ONES[h] + ' hundred' + rest
}

/**
 * Convert a number to words. Handles integers and two decimal places (e.g. currency).
 * Examples: 0 → "Zero", 1234.56 → "One thousand two hundred thirty-four and 56/100"
 */
export function numberToWords(value: number): string {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 'Zero'
  const clamped = Math.max(0, Math.min(999_999_999.99, value))
  const intPart = Math.floor(clamped)
  const decPart = Math.round((clamped - intPart) * 100)

  if (intPart === 0 && decPart === 0) return 'Zero'

  let words = ''
  if (intPart >= 1_000_000) {
    const millions = Math.floor(intPart / 1_000_000)
    words += hundreds(millions) + ' million '
  }
  let r = intPart % 1_000_000
  if (r >= 1_000) {
    const thousands = Math.floor(r / 1_000)
    words += hundreds(thousands) + ' thousand '
  }
  r = intPart % 1_000
  if (r > 0) {
    words += (words.length > 0 ? 'and ' : '') + hundreds(r)
  }
  words = words.trim()
  if (words === '') words = 'zero'

  if (decPart > 0) {
    words += ' and ' + String(decPart).padStart(2, '0') + '/100'
  }

  return capitalize(words.trim())
}
