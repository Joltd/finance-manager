import { useCurrencyListStore } from '@/store/account'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect } from 'react'

export interface CurrencyInputProps {
  value?: string
  onChange?: (value?: string) => void
  hideIcon?: boolean
  size?: 'default' | 'sm'
  className?: string
}

export function CurrencyInput({ value, onChange, hideIcon, size, className }: CurrencyInputProps) {
  const { dataFetched, data, fetch } = useCurrencyListStore('dataFetched', 'data', 'fetch') // todo support loading, error

  useEffect(() => {
    if (!dataFetched) {
      fetch()
    }
  }, [])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size={size} className={className} hideIcon={hideIcon}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {data?.map((it) => (
          <SelectItem key={it.name} value={it.name}>
            {it.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
