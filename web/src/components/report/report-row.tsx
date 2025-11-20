import { Amount } from '@/types/common/amount'
import { Stack } from '@/components/common/layout/stack'
import { Filler } from '@/components/common/layout/filler'
import { AmountLabelNew } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import React from 'react'

export interface ReportRowProps {
  label?: string | React.ReactNode
  amount: Amount
  maxAmount: Amount
  onHide?: () => void
}

export function ReportRow({ label, amount, maxAmount, onHide }: ReportRowProps) {
  const percent = Math.ceil((amount.value / maxAmount.value) * 100)

  return (
    <Stack gap={0}>
      <Stack orientation="horizontal">
        {typeof label === 'string' ? <Typography>{label}</Typography> : label}
        {onHide && (
          <Button variant="ghost" size="icon-sm" onClick={onHide}>
            <XIcon />
          </Button>
        )}
        <Filler />
        <AmountLabelNew variant="muted" amount={amount} shorten />
      </Stack>
      <Progress value={percent} />
    </Stack>
  )
}
