import React from 'react'
import { Flow } from '@/components/common/layout/flow'
import { Stack } from '@/components/common/layout/stack'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { cn } from '@/lib/utils'
import { Amount } from '@/types/common/amount'

export function ImportDataAmounts({
  label,
  amounts,
  className,
}: {
  label?: React.ReactNode
  amounts: Amount[]
  className?: string
}) {
  if (!amounts.length) return null

  return (
    <Stack
      orientation="horizontal"
      align="center"
      justify="between"
      gap={2}
      className={cn('ml-auto min-w-64', className)}
    >
      {label}
      <Flow align="center" gap={1} className="justify-end">
        {amounts.map((amount) => (
          <AmountLabel key={amount.currency} amount={amount} />
        ))}
      </Flow>
    </Stack>
  )
}
