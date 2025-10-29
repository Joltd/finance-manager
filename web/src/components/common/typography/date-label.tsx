import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Typography, TypographyProps } from '@/components/common/typography/typography'

export interface DateLabelProps extends TypographyProps {
  date: string
}

export function DateLabel({ date, ...props }: DateLabelProps) {
  const actualDate = parseISO(date)
  return <Typography {...props}>{format(actualDate, 'd MMMM yyyy')}</Typography>
}
