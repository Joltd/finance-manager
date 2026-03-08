'use client'

import * as React from 'react'
import { format, setMonth, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export interface MonthRange {
  from?: Date
  to?: Date
}

interface MonthCalendarSingleProps {
  mode?: 'single'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

interface MonthCalendarRangeProps {
  mode: 'range'
  selected?: MonthRange
  onSelect?: (range: MonthRange | undefined) => void
  className?: string
}

export type MonthCalendarProps = MonthCalendarSingleProps | MonthCalendarRangeProps

export function MonthCalendar(props: MonthCalendarProps) {
  const { className } = props
  const today = startOfMonth(new Date())
  const [year, setYear] = React.useState(today.getFullYear())

  function handleClick(monthDate: Date) {
    if (props.mode !== 'range') {
      props.onSelect?.(monthDate)
      return
    }

    const { from, to } = props.selected ?? {}

    if (!from || (from && to)) {
      props.onSelect?.({ from: monthDate, to: undefined })
    } else if (monthDate >= from) {
      props.onSelect?.({ from, to: monthDate })
    } else {
      props.onSelect?.({ from: monthDate, to: undefined })
    }
  }

  function getModifiers(monthDate: Date) {
    const t = monthDate.getTime()

    if (props.mode !== 'range') {
      const isSelected =
        props.selected instanceof Date && startOfMonth(props.selected).getTime() === t
      return { isSelected, isRangeStart: false, isRangeMiddle: false, isRangeEnd: false }
    }

    const from = props.selected?.from ? startOfMonth(props.selected.from) : undefined
    const to = props.selected?.to ? startOfMonth(props.selected.to) : undefined

    const isRangeStart = !!from && t === from.getTime()
    const isRangeEnd = !!to && t === to.getTime()
    const isRangeMiddle = !!from && !!to && t > from.getTime() && t < to.getTime()

    return { isSelected: isRangeStart || isRangeEnd, isRangeStart, isRangeMiddle, isRangeEnd }
  }

  return (
    <div
      data-slot="calendar"
      className={cn('bg-background p-3 w-fit [--cell-size:--spacing(8)]', className)}
    >
      <div className="relative flex w-full items-center justify-between gap-1 mb-3">
        <button
          onClick={() => setYear((y) => y - 1)}
          className={cn(buttonVariants({ variant: 'ghost' }), 'size-(--cell-size) p-0 select-none')}
        >
          <ChevronLeftIcon className="size-4" />
        </button>

        <span className="text-sm font-medium select-none">{year}</span>

        <button
          onClick={() => setYear((y) => y + 1)}
          className={cn(buttonVariants({ variant: 'ghost' }), 'size-(--cell-size) p-0 select-none')}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-y-1">
        {Array.from({ length: 12 }, (_, i) => {
          const monthDate = startOfMonth(setMonth(new Date(year, 0, 1), i))
          const isToday = today.getTime() === monthDate.getTime()
          const { isSelected, isRangeStart, isRangeMiddle, isRangeEnd } = getModifiers(monthDate)

          const isPrimary = isSelected || isRangeStart || isRangeEnd

          return (
            <button
              key={i}
              onClick={() => handleClick(monthDate)}
              className={cn(
                buttonVariants({ variant: isPrimary ? 'default' : 'ghost' }),
                'h-9 w-full text-sm font-normal capitalize',
                isToday &&
                  !isPrimary &&
                  !isRangeMiddle &&
                  'rounded-md bg-accent text-accent-foreground',
                isRangeMiddle &&
                  'rounded-none bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {format(monthDate, 'LLL', { locale: ru })}
            </button>
          )
        })}
      </div>
    </div>
  )
}
