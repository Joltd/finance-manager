'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { Amount, amountFromDecimal, toDecimal } from '@/types/common/amount'
import { CurrencyInput } from '@/components/common/input/currency-input'

type AmountInputProps = {
  value?: Amount
  onChange?: (value: Amount | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

function AmountInput({
  value,
  onChange,
  placeholder = '0',
  disabled,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: AmountInputProps) {
  const [display, setDisplay] = useState<string>(() =>
    value !== undefined ? String(toDecimal(value)) : '',
  )

  // Sync display when value is reset externally (e.g. form reset)
  useEffect(() => {
    const external = value !== undefined ? toDecimal(value) : null
    const local = display === '' ? null : parseFloat(display.replace(',', '.'))
    if (external !== local) {
      setDisplay(external !== null ? String(external) : '')
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNumberChange = (raw: string) => {
    if (raw !== '' && !/^-?\d*[.,]?\d*$/.test(raw)) return
    setDisplay(raw)

    const num = parseFloat(raw.replace(',', '.'))
    const currency = value?.currency ?? ''
    if (raw === '' || isNaN(num) || !currency) {
      onChange?.(undefined)
    } else {
      onChange?.(amountFromDecimal(num, currency))
    }
  }

  const handleCurrencyChange = (currency: string) => {
    const num = parseFloat(display.replace(',', '.'))
    onChange?.(amountFromDecimal(isNaN(num) ? 0 : num, currency))
  }

  return (
    <div
      data-slot="input"
      aria-invalid={ariaInvalid}
      className={cn(
        'border-input dark:bg-input/30 flex h-9 w-full min-w-0 overflow-hidden rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
    >
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={(e) => handleNumberChange(e.target.value)}
        className={cn(
          'placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-3 py-1 text-base outline-none md:text-sm',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />
      <div className="border-input border-l">
        <CurrencyInput
          value={value?.currency}
          onChange={handleCurrencyChange}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          placeholder=""
          className="h-full rounded-none border-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  )
}

export { AmountInput }
export type { AmountInputProps }
