import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isSameYear, parseISO, startOfMonth, subMonths } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateCommon(dateStr: string): string {
  const date = parseISO(dateStr)
  // if (isToday(date)) return 'Today'
  // if (isYesterday(date)) return 'Yesterday'
  if (isSameYear(date, new Date())) return format(date, 'd MMM')
  return format(date, 'd MMM yyyy')
}

export function formatMonth(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy')
}

export function getDefaultMonthRange(monthsBack = 5) {
  const now = new Date()
  return {
    from: subMonths(startOfMonth(now), monthsBack),
    to: startOfMonth(now),
  }
}
