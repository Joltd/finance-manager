import { add, format, Interval, startOfWeek, sub } from 'date-fns'

export function asDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date
}

export function asUtc(date: Date | string): Date {
  const actualDate = asDate(date)
  return new Date(Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate()))
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

export function asDateRangeValue(interval: Interval): RangeValue<string> {
  return {
    from: format(interval.start, 'yyyy-MM-dd'),
    to: format(interval.end, 'yyyy-MM-dd'),
  }
}

export function formatWeek(week?: RangeValue<string>): string {
  if (!week?.from || !week?.to) {
    return 'Invalid week'
  }

  return `${format(week.from, 'yyyy-MM-dd')} - ${format(sub(week.to, { days: 1 }), 'yyyy-MM-dd')}`
}
