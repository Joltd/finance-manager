'use client'

import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/common/input/currency-input'
import { Amount } from '@/types/common/amount'

export interface AmountInputProps {
  amount?: Amount
  onChange?: (amount: Amount) => void
}

export function AmountInput({ amount, onChange }: AmountInputProps) {
  const handleChangeValue = (value: string) => {
    const actualValue = (+value || 0) * 10000
    if (amount?.value !== actualValue) {
      onChange?.({ value: actualValue, currency: amount?.currency as any })
    }
  }

  const handleChangeCurrency = (currency?: string) => {
    if (!!currency && amount?.currency !== currency) {
      onChange?.({ value: amount?.value || 0, currency: currency })
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
        value={amount ? (amount?.value / 10000).toString() : ''}
        onChange={(e) => handleChangeValue(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <CurrencyInput value={amount?.currency} onChange={handleChangeCurrency} />
    </div>
  )
}
