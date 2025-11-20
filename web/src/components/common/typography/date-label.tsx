import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Typography, TypographyProps } from '@/components/common/typography/typography'

export interface DateLabelProps extends TypographyProps {
  date: string
  pattern?: string
}

export function DateLabel({ date, pattern, ...props }: DateLabelProps) {
  const actualDate = parseISO(date)
  return <Typography {...props}>{format(actualDate, pattern || 'd MMMM yyyy')}</Typography>
}
