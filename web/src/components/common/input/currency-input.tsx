import { useEffect } from 'react'

import { ReferenceInput } from '@/components/common/input/reference-input'
import { useCurrencyListStore } from '@/store/account'
import { Currency } from '@/types/account'

export type CurrencyInputProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

export function CurrencyInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
}: CurrencyInputProps) {
  const { data, fetch } = useCurrencyListStore()

  useEffect(() => {
    void fetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCurrency = data?.find((c) => c.name === value)

  return (
    <ReferenceInput<Currency>
      data={data}
      getLabel={(c) => c.name}
      getId={(c) => c.name}
      value={selectedCurrency}
      onChange={(c) => onChange?.(c.name)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
    />
  )
}
