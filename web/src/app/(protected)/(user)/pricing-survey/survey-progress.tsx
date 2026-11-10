import { Progress } from '@/components/ui/progress'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { formatDateCommon } from '@/lib/utils'
import { PricingSurveySummary } from '@/types/pricing-survey'

// The survey itself has no dates: its period is derived from the orders collected so far
export function formatSurveyPeriod({ dateFrom, dateTo }: Pick<PricingSurveySummary, 'dateFrom' | 'dateTo'>): string {
  if (!dateFrom || !dateTo) return 'No prices yet'
  if (dateFrom === dateTo) return formatDateCommon(dateFrom)
  return `${formatDateCommon(dateFrom)} – ${formatDateCommon(dateTo)}`
}

interface SurveyProgressProps {
  filled: number
  total: number
  className?: string
}

export function SurveyProgress({ filled, total, className }: SurveyProgressProps) {
  const value = total > 0 ? Math.round((filled / total) * 100) : 0

  return (
    <Stack orientation="horizontal" align="center" gap={3} className={className}>
      <Progress value={value} className="flex-1" />
      <Typography as="span" variant="muted" className="shrink-0 tabular-nums">
        {filled} / {total}
      </Typography>
    </Stack>
  )
}
