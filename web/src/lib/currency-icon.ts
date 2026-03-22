const CURRENCY_SVG_PATHS: Record<string, string> = {
  USD: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  EUR: '<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  GBP: '<path d="M18 7c0-5.333-8-5.333-8 0"/><path d="M10 7v14"/><path d="M6 21h12"/><path d="M6 13h10"/>',
  JPY: '<path d="M12 9.5V21m0-11.5L6 3m6 6.5L18 3"/><path d="M6 15h12"/><path d="M6 11h12"/>',
  CNY: '<path d="M12 9.5V21m0-11.5L6 3m6 6.5L18 3"/><path d="M6 15h12"/><path d="M6 11h12"/>',
  INR: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>',
  RUB: '<path d="M6 11h8a4 4 0 0 0 0-8H9v18"/><path d="M6 15h8"/>',
  CHF: '<path d="M10 21V3h8"/><path d="M6 16h9"/><path d="M10 9.5h7"/>',
  TRY: '<path d="M15 4 5 9"/><path d="m15 8.5-10 5"/><path d="M18 12a9 9 0 0 1-9 9V3"/>',
  BTC: '<path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>',
  PHP: '<path d="M20 11H4"/><path d="M20 7H4"/><path d="M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7"/>',
  GEL: '<path d="M11.5 21a7.5 7.5 0 1 1 7.35-9"/><path d="M13 12V3"/><path d="M4 21h16"/><path d="M9 12V3"/>',
}

const FALLBACK_PATHS = CURRENCY_SVG_PATHS.USD

export function buildCurrencyIconSvg(currency: string | undefined): string {
  const paths = currency ? (CURRENCY_SVG_PATHS[currency] ?? FALLBACK_PATHS) : FALLBACK_PATHS
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="none" stroke="#e2e8f0" stroke-width="1"/><g transform="translate(8,8) scale(0.6667)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${paths}</g></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
