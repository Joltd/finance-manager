import { RangeValue } from '@/types/common'
import { add, DateArg, format, Interval, parse, startOfMonth, startOfWeek, sub } from 'date-fns'
import { minus } from '@/types/common/amount'

export function asDate(date?: Date | string): Date {
  return date === undefined ? new Date() : typeof date === 'string' ? new Date(date) : date
}

export function asUtc(date?: Date | string): Date {
  const actualDate = asDate(date)
  return new Date(Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate()))
}

export function formatDate(date?: DateArg<Date>): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined
}

export function parseDate(date?: string): Date | undefined {
  return date ? parse(date, 'yyyy-MM-dd', new Date()) : new Date()
}

export function asMonday(date: Date | string) {
  const actualDate = asUtc(date)
  return startOfWeek(actualDate, { weekStartsOn: 1 })
}

export function asWeek(day: Date | string): Interval {
  const start = asMonday(day)
  const end = add(start, { weeks: 1 })
  return { start, end }
}

export function currentAndPreviousMonths(count: number): Interval {
  const date = asUtc()
  const end = add(startOfMonth(date), { months: 1 })
  const start = sub(end, { months: count })
  return {
    start,
    end,
  }
}

export function asDateRangeValue(interval: Interval): RangeValue<string> {
  return {
    from: formatDate(interval.start),
    to: formatDate(interval.end),
  }
}

export function formatRange(range?: RangeValue<string>): string {
  if (!range?.from || !range?.to) {
    return 'Invalid range'
  }

  return `${formatDate(range.from)} - ${formatDate(range.to)}`
}

export function formatWeek(week?: RangeValue<string>): string {
  if (!week?.from || !week?.to) {
    return 'Invalid week'
  }

  return `${formatDate(week.from)} - ${formatDate(sub(week.to, { days: 1 }))}`
}
