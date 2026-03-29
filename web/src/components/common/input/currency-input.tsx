import { useEffect } from 'react'

import { ReferenceInput } from '@/components/common/input/reference-input'
import { cn } from '@/lib/utils'
import { useCurrencyListStore } from '@/store/account'
import { Currency } from '@/types/account'

type CurrencyInputBaseProps = {
  placeholder?: string
  disabled?: boolean
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

export type CurrencyInputProps =
  | (CurrencyInputBaseProps & { mode?: 'single'; value?: string; onChange?: (value: string) => void })
  | (CurrencyInputBaseProps & { mode: 'multi'; value?: string[]; onChange?: (value: string[]) => void })

export function CurrencyInput(props: CurrencyInputProps) {
  const { placeholder, disabled, className, 'aria-invalid': ariaInvalid } = props
  const { data, fetch } = useCurrencyListStore()

  useEffect(() => {
    void fetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const common = {
    data,
    getLabel: (c: Currency) => c.name,
    getId: (c: Currency) => c.name,
    placeholder,
    disabled,
    className: cn('min-w-[5.5rem]', className),
    'aria-invalid': ariaInvalid,
  }

  if (props.mode === 'multi') {
    const selected = data?.filter((c) => props.value?.includes(c.name))
    return (
      <ReferenceInput<Currency>
        mode="multi"
        {...common}
        value={selected}
        onChange={(currencies) => props.onChange?.(currencies.map((c) => c.name))}
      />
    )
  }

  const selected = data?.find((c) => c.name === props.value)
  return (
    <ReferenceInput<Currency>
      {...common}
      value={selected}
      onChange={(c) => props.onChange?.(c.name)}
    />
  )
}
