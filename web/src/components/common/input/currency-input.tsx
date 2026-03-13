'use client'

import { useEffect } from 'react'

import { useCurrencyListStore } from '@/store/account'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CurrencyInputProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: CurrencyInputProps) {
  const { data, fetch } = useCurrencyListStore()

  useEffect(() => {
    if (!data) void fetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className={className} aria-invalid={ariaInvalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        {data?.map((currency) => (
          <SelectItem key={currency.name} value={currency.name}>
            {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { CurrencyInput }
export type { CurrencyInputProps }
