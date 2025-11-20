import { RangeValue } from '@/types/common'
import {
  add,
  addMonths,
  DateArg,
  format,
  Interval,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
  sub,
} from 'date-fns'
import { minus } from '@/types/common/amount'
import { DateRange } from 'react-day-picker'

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

export function formatMonth(date?: DateArg<Date>): string | undefined {
  return date ? format(date, 'MMMM yyyy') : undefined
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

export function currentAndPreviousMonths(count: number): RangeValue<string> {
  const current = startOfMonth(asUtc())
  return asModelMonthRange({
    from: addMonths(current, -count),
    to: current,
  })!!
}

export function asDateRangeValue(interval: Interval): RangeValue<string> {
  return {
    from: formatDate(interval.start),
    to: formatDate(interval.end),
  }
}

export function asVisualMonthRange(range?: RangeValue<string>): DateRange | undefined {
  const from = range?.from
  const to = range?.to
  if (!from || !to) {
    return undefined
  }

  return {
    from: startOfMonth(from),
    to: addMonths(startOfMonth(to), -1),
  }
}

export function asModelMonthRange(range?: DateRange): RangeValue<string> | undefined {
  const from = range?.from
  const to = range?.to
  if (!from || !to) {
    return undefined
  }

  return {
    from: formatDate(startOfMonth(from)),
    to: formatDate(addMonths(startOfMonth(to), 1)),
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

export function formatMonthRange(range?: RangeValue<string>): string {
  const visualRange = asVisualMonthRange(range)
  const from = visualRange?.from
  const to = visualRange?.to

  if (!from || !to) {
    return 'Invalid range'
  }

  if (isSameMonth(from, to)) {
    return `${formatMonth(from)}`
  }

  return `${formatMonth(from)} - ${formatMonth(to)}`
}
