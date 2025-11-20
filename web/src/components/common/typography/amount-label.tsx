import { CurrencyLabel } from '@/components/common/typography/currency-label'
import { cn } from '@/lib/utils'
import { ValueLabel, ValueLabelNew } from '@/components/common/typography/value-label'

import { Amount } from '@/types/common/amount'
import { Typography, TypographyProps } from '@/components/common/typography/typography'
import React from 'react'

export interface AmountLabelProps {
  amount?: Amount
  shorten?: boolean
  className?: string
}

export function AmountLabel({ amount, shorten, className }: AmountLabelProps) {
  const value = (amount?.value || 0) / 10000

  return (
    <div className={cn('flex items-center gap-1 min-w-10', className)}>
      {amount && (
        <>
          <ValueLabel value={value} shorten={shorten} />
          <CurrencyLabel currency={amount.currency} />
        </>
      )}
    </div>
  )
}

export interface AmountLabelNewProps extends TypographyProps {
  amount?: Amount
  shorten?: boolean
}

export function AmountLabelNew({ amount, shorten, ...props }: AmountLabelNewProps) {
  const Component = props.as === 'tspan' ? 'tspan' : 'span'
  return (
    amount && (
      <Typography {...props}>
        <ValueLabelNew value={amount.value / 10000} shorten={shorten} />
        &nbsp;
        <Component className="text-muted-foreground">{amount?.currency}</Component>
      </Typography>
    )
  )
}
