'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Amount } from "@/types/common";

export interface AmountInputProps {
  amount?: Amount
  onChange?: (amount: Amount) => void
}

export function AmountInput({ amount, onChange }: AmountInputProps) {
  const currencies = ['USD', 'EUR', 'RUB', 'GEL']
  const [inputCurrency, setInputCurrency] = useState<string>(amount?.currency || currencies[0])
  const [inputValue, setInputValue] = useState<string>(amount?.value ? (amount?.value / 10000).toString() : '')

  useEffect(() => {
    const newAmount = { value: +inputValue * 10000, currency: inputCurrency }
    if (amount?.value === newAmount.value && amount?.currency === newAmount.currency) {
      return
    }
    onChange?.(newAmount)
  }, [inputValue, inputCurrency]);

  const handleChangeValue = (value: string) => {
    setInputValue(value)
  }

  const handleChangeCurrency = (currency: string) => {
    setInputCurrency(currency)
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

      <Select value={inputCurrency} onValueChange={handleChangeCurrency}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((it) => (
            <SelectItem key={it} value={it}>{it}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}