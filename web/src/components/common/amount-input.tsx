'use client'

import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { Amount } from '@/types/common'
import { CurrencyInput } from '@/components/common/currency-input'

export interface AmountInputProps {
  amount?: Amount
  onChange?: (amount: Amount) => void
}

export function AmountInput({ amount, onChange }: AmountInputProps) {
  const [inputCurrency, setInputCurrency] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    setInputCurrency(amount?.currency || '')
    setInputValue(amount?.value ? (amount?.value / 10000).toString() : '')
  }, [amount])

  useEffect(() => {
    if (!inputCurrency) {
      return
    }
    const newAmount = { value: +inputValue * 10000, currency: inputCurrency }
    if (amount?.value === newAmount.value && amount?.currency === newAmount.currency) {
      return
    }
    onChange?.(newAmount)
  }, [inputValue, inputCurrency])

  const handleChangeValue = (value: string) => {
    setInputValue(value)
  }

  const handleChangeCurrency = (currency?: string) => {
    setInputCurrency(currency || '')
  }

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
        value={inputValue}
        onChange={(e) => handleChangeValue(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <CurrencyInput value={inputCurrency} onChange={handleChangeCurrency} />
    </div>
  )
}
