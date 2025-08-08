import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { add, format, isWithinInterval } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { RangeValue } from '@/types/common'
import { asDateRangeValue, asMonday, asUtc, asWeek, formatWeek } from '@/lib/date'
import { useState } from 'react'
import { FilterPrimitiveProps } from '@/types/filter'

export interface WeekFilterProps extends FilterPrimitiveProps {
  from?: string
  to?: string
  value?: RangeValue<string>
  onChange?: (value: RangeValue<string>) => void
}

export function WeekFilter({ from, to, value, onChange }: WeekFilterProps) {
  const [opened, setOpened] = useState(false)
  const actualFrom = from ? asMonday(from) : undefined
  const actualTo = to ? asMonday(to) : undefined

  const selected = (date: any) => {
    return !!value?.from && isWithinInterval(asUtc(date), asWeek(value.from))
  }

  const handleDayClick = (day: Date) => {
    const week = asWeek(day)
    onChange?.(asDateRangeValue(week))
    setOpened(false)
  }

  const handlePrevWeek = () => {
    if (!value?.from) {
      return
    }
    const prevFrom = add(asUtc(value.from), { weeks: -1 })
    const week = asWeek(prevFrom)
    onChange?.(asDateRangeValue(week))
  }

  const handleNextWeek = () => {
    if (!value?.from) {
      return
    }
    const prevFrom = add(asUtc(value.from), { weeks: 1 })
    const week = asWeek(prevFrom)
    onChange?.(asDateRangeValue(week))
  }

  const handleFirstWeek = () => {
    if (from) {
      handleDayClick(asUtc(from))
    }
  }

  const handleLastWeek = () => {
    if (to) {
      handleDayClick(asUtc(to))
    }
  }

  const buttonProps: { size: 'sm'; variant: 'outline'; className: string } = {
    size: 'sm',
    variant: 'outline',
    className: 'not-last:rounded-r-none not-first:rounded-l-none',
  }

  return (
    <div className="flex">
      {actualFrom && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button {...buttonProps} onClick={handleFirstWeek}>
              <ChevronFirstIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{format(actualFrom, 'yyyy-MM-dd')}</TooltipContent>
        </Tooltip>
      )}
      <Button {...buttonProps} onClick={handlePrevWeek}>
        <ChevronLeftIcon />
      </Button>
      <Popover modal open={opened} onOpenChange={setOpened}>
        <PopoverTrigger asChild>
          <Button {...buttonProps}>{formatWeek(value)}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            month={value?.from ? asUtc(value?.from) : undefined}
            onDayClick={handleDayClick}
            modifiers={{
              selected,
            }}
          />
        </PopoverContent>
      </Popover>
      <Button {...buttonProps} onClick={handleNextWeek}>
        <ChevronRightIcon />
      </Button>
      {actualTo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button {...buttonProps} onClick={handleLastWeek}>
              <ChevronLastIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{format(actualTo, 'yyyy-MM-dd')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
