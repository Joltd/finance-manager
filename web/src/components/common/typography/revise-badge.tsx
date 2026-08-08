'use client'

import { format, isBefore, parseISO, subWeeks } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface ReviseBadgeProps {
  reviseDate?: string
}

export function ReviseBadge({ reviseDate }: ReviseBadgeProps) {
  const overdue = reviseDate && isBefore(parseISO(reviseDate), subWeeks(new Date(), 2))

  if (!overdue) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline">Revise</Badge>
      </TooltipTrigger>
      <TooltipContent>Last revised: {format(parseISO(reviseDate!), 'dd MMM yyyy')}</TooltipContent>
    </Tooltip>
  )
}
