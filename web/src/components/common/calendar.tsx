import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import {
  addMonths,
  addYears,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

export type Mode = 'single' | 'range'

export interface PropsBase {
  mode: Mode
}

export interface PropsSingle {
  mode: 'single'
  selected?: Date
  onSelect?: (selected: Date | undefined) => void
}

export interface PropsRange {
  mode: 'range'
  selected?: DateRange // assume #1 - `to` is include in range, assume #2 - `from` and `to` is a start of month
  onSelect?: (selected: DateRange | undefined) => void
}

export type MonthCalendarProps = PropsBase & (PropsSingle | PropsRange)

export function MonthCalendar({ mode, selected, onSelect }: MonthCalendarProps) {
  const [year, setYear] = useState(startOfYear(new Date()))

  const handlePrevYear = () => {
    setYear((prev) => addYears(prev, -1))
  }

  const handleNextYear = () => {
    setYear((prev) => addYears(prev, 1))
  }

  const handleMonthClick = (month: Date) => {
    if (mode === 'single') {
      if (selected && isSameMonth(selected, month)) {
        onSelect?.(undefined)
      } else {
        onSelect?.(month)
      }
      return
    }

    if (mode === 'range') {
      if (selected?.from && !selected?.to) {
        if (month < selected.from) {
          onSelect?.({ from: month, to: selected.from })
        } else {
          onSelect?.({ from: selected.from, to: month })
        }
      } else {
        onSelect?.({ from: month, to: undefined })
      }
    }
  }

  function isSelected(month: Date | undefined) {
    if (!month) {
      return false
    }

    if (mode === 'single') {
      return selected && isSameMonth(month, selected)
    }

    if (mode === 'range') {
      return (
        (selected?.from && isSameMonth(month, selected?.from)) ||
        (selected?.to && isSameMonth(month, selected?.to))
      )
    }

    return false
  }

  function isInRange(month?: Date) {
    if (mode !== 'range' || !month || !selected?.from || !selected?.to) {
      return false
    }
    return isAfter(month, selected.from) && isBefore(month, selected.to)
  }

  return (
    <div className="flex flex-col fit">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={handlePrevYear}>
          <ChevronLeftIcon />
        </Button>
        <div className="grow text-center">{format(year, 'yyyy')}</div>
        <Button variant="ghost" size="icon" onClick={handleNextYear}>
          <ChevronRightIcon />
        </Button>
      </div>
      <table className="w-fit">
        <tbody>
          {Array(4)
            .fill(0)
            .map((_, row) => (
              <tr key={row} className="flex w-full mt-2">
                {Array(3)
                  .fill(0)
                  .map((_, column) => {
                    const month = addMonths(year, 3 * row + column)
                    return (
                      <td
                        key={month.toString()}
                        className="[&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md select-none text-muted-foreground aria-selected:text-muted-foreground"
                        data-selected={isSelected(month) || isInRange(month)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMonthClick(month)}
                          data-selected-single={isSelected(month)}
                          data-range-start={isSelected(month)}
                          data-range-end={isSelected(month)}
                          data-range-middle={isInRange(month)}
                          className={cn(
                            'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
                            'data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:rounded-none',
                            'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md',
                            'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md',
                            '[&>span]:text-xs [&>span]:opacity-70',
                            'dark:hover:text-accent-foreground flex w-16 h-12 flex-col leading-none font-normal',
                          )}
                        >
                          {format(month, 'MMM')}
                        </Button>
                      </td>
                    )
                  })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
