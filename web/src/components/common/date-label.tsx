import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

export interface DateLabelProps {
  date: string
  className?: string
}

export function DateLabel({ date, className }: DateLabelProps) {
  const actualDate = parseISO(date)
  return <span className={cn('select-none', className)}>{format(actualDate, 'd MMMM yyyy')}</span>
}
