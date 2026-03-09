'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type MonthRange = { from?: Date; to?: Date }

type SingleProps = {
  mode?: 'single'
  value?: Date
  onChange?: (date: Date | undefined) => void
}

type RangeProps = {
  mode: 'range'
  value?: MonthRange
  onChange?: (range: MonthRange) => void
}

export type MonthInputProps = (SingleProps | RangeProps) & {
  placeholder?: string
  disabled?: boolean
  className?: string
}

function monthIdx(d: Date) {
  return d.getFullYear() * 12 + d.getMonth()
}

export function MonthInput(props: MonthInputProps) {
  const { mode = 'single', placeholder = 'Select', disabled = false, className } = props

  const [open, setOpen] = React.useState(false)
  const [year, setYear] = React.useState(() => new Date().getFullYear())

  // Sync displayed year to value when picker opens
  useEffect(() => {
    if (!open) return
    if (mode === 'single') {
      const v = (props as SingleProps).value
      if (v) setYear(v.getFullYear())
    } else {
      const rv = (props as RangeProps).value
      if (rv?.to) setYear(rv.to.getFullYear())
      else if (rv?.from) setYear(rv.from.getFullYear())
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (month: number) => {
    const clicked = new Date(year, month, 1)

    if (mode === 'single') {
      ;(props as SingleProps).onChange?.(clicked)
      setOpen(false)
      return
    }

    const { value, onChange } = props as RangeProps
    const from = value?.from
    const to = value?.to

    if (!from || to) {
      onChange?.({ from: clicked })
    } else if (monthIdx(clicked) >= monthIdx(from)) {
      onChange?.({ from, to: clicked })
      setOpen(false)
    } else {
      onChange?.({ from: clicked })
    }
  }

  // Trigger label
  let label: React.ReactNode
  let hasValue = false
  if (mode === 'single') {
    const v = (props as SingleProps).value
    hasValue = !!v
    label = v ? format(v, 'MMM yyyy') : placeholder
  } else {
    const rv = (props as RangeProps).value
    const from = rv?.from
    const to = rv?.to
    hasValue = !!from
    if (from && to) {
      label = `${format(from, 'MMM yyyy')} – ${format(to, 'MMM yyyy')}`
    } else if (from) {
      label = `${format(from, 'MMM yyyy')} – ...`
    } else {
      label = placeholder
    }
  }

  // Per-month visual state
  const getState = (month: number) => {
    const idx = year * 12 + month

    if (mode === 'single') {
      const v = (props as SingleProps).value
      const isSelected = !!v && v.getFullYear() === year && v.getMonth() === month
      return { isPrimary: isSelected, isInRange: false }
    }

    const rv = (props as RangeProps).value
    const from = rv?.from
    const to = rv?.to
    const fromIdx = from ? monthIdx(from) : null
    const toIdx = to ? monthIdx(to) : null

    const isPrimary = (fromIdx !== null && idx === fromIdx) || (toIdx !== null && idx === toIdx)
    const isInRange = fromIdx !== null && toIdx !== null && idx > fromIdx && idx < toIdx

    return { isPrimary, isInRange }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="input"
          variant="outline"
          disabled={disabled}
          aria-haspopup="dialog"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'justify-start font-normal',
            !hasValue && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 opacity-60" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm font-medium">{year}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const { isPrimary, isInRange } = getState(i)
            return (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 text-xs',
                  isPrimary &&
                    'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                  isInRange && !isPrimary && 'bg-accent text-accent-foreground',
                )}
                onClick={() => handleSelect(i)}
              >
                {format(new Date(year, i, 1), 'MMM')}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
