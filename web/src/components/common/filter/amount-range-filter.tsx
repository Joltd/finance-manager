'use client'

import { useState, useEffect, useRef } from 'react'
import { FilterItem, useFilterContext } from '@/components/common/filter/filter'
import { decimalToScaled, scaledToDecimal } from '@/types/common/amount'

export interface AmountRange {
  from?: number
  to?: number
}

function AmountRangeInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
}) {
  const [display, setDisplay] = useState(() => value !== undefined ? String(scaledToDecimal(value)) : '')

  useEffect(() => {
    const external = value !== undefined ? String(scaledToDecimal(value)) : ''
    if (decimalToScaled(display) !== value) setDisplay(external)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (raw: string) => {
    if (raw !== '' && !/^-?\d*[.,]?\d*$/.test(raw)) return
    setDisplay(raw)
    onChange(decimalToScaled(raw))
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      className="placeholder:text-muted-foreground h-full w-20 min-w-0 bg-transparent px-2 text-sm outline-none"
    />
  )
}

export interface AmountRangeFilterProps {
  id: string
  label: string
}

const DEBOUNCE_MS = 400

export function AmountRangeFilter({ id, label }: AmountRangeFilterProps) {
  const { getValue, handleChange } = useFilterContext()
  const contextRange = (getValue(id) ?? {}) as AmountRange
  const [pending, setPending] = useState<AmountRange>(contextRange)
  const mounted = useRef(false)

  // Sync from external (e.g. filter reset) — only when values actually differ
  useEffect(() => {
    if (pending.from !== contextRange.from || pending.to !== contextRange.to) {
      setPending({ from: contextRange.from, to: contextRange.to })
    }
  }, [contextRange.from, contextRange.to]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced write to filter context
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const timer = setTimeout(() => {
      if (pending.from != null || pending.to != null) handleChange(id, pending)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [pending.from, pending.to]) // eslint-disable-line react-hooks/exhaustive-deps

  const setFrom = (from: number | undefined) => setPending((prev) => ({ ...prev, from }))
  const setTo = (to: number | undefined) => setPending((prev) => ({ ...prev, to }))

  return (
    <FilterItem id={id} label={label}>
      <AmountRangeInput value={pending.from} onChange={setFrom} placeholder="from" />
      <span className="text-muted-foreground self-center text-xs">—</span>
      <AmountRangeInput value={pending.to} onChange={setTo} placeholder="to" />
    </FilterItem>
  )
}
