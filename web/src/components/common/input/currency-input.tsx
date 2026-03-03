'use client'

import { useEffect } from 'react'

import { useCurrencyStore } from '@/store/account'
import { SelectInput, SelectInputOption } from '@/components/common/input/select-input'

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
  const { data, fetch } = useCurrencyStore()

  useEffect(() => {
    if (!data) void fetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SelectInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      id={id}
      aria-invalid={ariaInvalid}
    >
      {data?.map((currency) => (
        <SelectInputOption key={currency.name} id={currency.name} label={currency.name} />
      ))}
    </SelectInput>
  )
}

export { CurrencyInput }
export type { CurrencyInputProps }
