import { format, parseISO } from 'date-fns'

export interface DateLabelProps {
  date: string
}

export function DateLabel({ date }: DateLabelProps) {
  const actualDate = parseISO(date)
  return <span className="select-none">{format(actualDate, 'd MMMM yyyy')}</span>
}
