// value is stored as integer with 4 decimal places (SCALE=4)
// e.g. 1.5 USD → { value: 15000, currency: "USD" }

export interface Amount {
  value: number
  currency: string
}

const SCALE = 4
const SCALE_FACTOR = 10 ** SCALE

// --- constructors ---

export function amount(value: number, currency: string): Amount {
  return { value: Math.trunc(value), currency }
}

export function amountFromDecimal(decimal: number, currency: string): Amount {
  return { value: Math.round(decimal * SCALE_FACTOR), currency }
}

export function amountFromString(str: string, currency: string): Amount {
  const normalized = str.replace(',', '.')
  return amountFromDecimal(parseFloat(normalized), currency)
}

export function emptyAmount(currency: string): Amount {
  return { value: 0, currency }
}

// --- conversion ---

export function toDecimal(a: Amount): number {
  return a.value / SCALE_FACTOR
}

export function toDisplayString(a: Amount): string {
  return `${toDecimal(a).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: SCALE })} ${a.currency}`
}

// --- arithmetic ---

function checkSameCurrency(a: Amount, b: Amount): void {
  if (a.currency !== b.currency) {
    throw new Error(
      `Cannot operate on amounts with different currencies: ${a.currency} and ${b.currency}`,
    )
  }
}

export function add(a: Amount, b: Amount): Amount {
  checkSameCurrency(a, b)
  return { value: a.value + b.value, currency: a.currency }
}

export function subtract(a: Amount, b: Amount): Amount {
  checkSameCurrency(a, b)
  return { value: a.value - b.value, currency: a.currency }
}

export function negate(a: Amount): Amount {
  return { value: -a.value, currency: a.currency }
}

export function abs(a: Amount): Amount {
  return { value: Math.abs(a.value), currency: a.currency }
}

export function multiply(a: Amount, factor: number): Amount {
  return { value: Math.round(a.value * factor), currency: a.currency }
}

export function convert(a: Amount, rate: number, targetCurrency: string): Amount {
  return { value: Math.round(a.value * rate), currency: targetCurrency }
}

// --- scale conversion ---

export function decimalToScaled(decimal: string | number): number | undefined {
  const num = typeof decimal === 'number' ? decimal : parseFloat(decimal.replace(',', '.'))
  return isNaN(num) ? undefined : Math.round(num * SCALE_FACTOR)
}

export function scaledToDecimal(scaled: number): number {
  return scaled / SCALE_FACTOR
}

// --- comparison ---

export function compare(a: Amount, b: Amount): number {
  checkSameCurrency(a, b)
  return a.value - b.value
}

export function isZero(a: Amount): boolean {
  return a.value === 0
}

export function isNotZero(a: Amount): boolean {
  return a.value !== 0
}

export function isPositive(a: Amount): boolean {
  return a.value > 0
}

export function isNegative(a: Amount): boolean {
  return a.value < 0
}

// --- aggregation ---

export function sumAmounts(amounts: Amount[], currency: string): Amount {
  return amounts.reduce((acc, a) => add(acc, a), emptyAmount(currency))
}

export function accumulate(a: Amount | undefined, b: Amount): Amount {
  return a ? add(a, b) : b
}
