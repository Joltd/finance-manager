import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import {
  asDateRangeValue,
  asModelMonthRange,
  asMonday,
  asUtc,
  asVisualMonthRange,
  asWeek,
  formatMonthRange,
  formatWeek,
} from '@/lib/date'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { MonthCalendar } from '@/components/common/calendar'
import {
  FilterButton,
  FilterButtonProps,
  useFilterContext,
} from '@/components/common/filter/filter'
import { add, format, isWithinInterval } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

export interface MonthRangeFilterProps extends FilterButtonProps {}

export function MonthRangeFilter({ id, label = 'Months', ...props }: MonthRangeFilterProps) {
  const [opened, setOpened] = useState(false)
  const { value, updateValue } = useFilterContext()
  const [local, setLocal] = useState<DateRange | undefined>(asVisualMonthRange(value[id]))

  const handleApplyValue = () => {
    const result = asModelMonthRange(local)
    if (result) {
      updateValue(id, result)
    }
    setOpened(false)
  }

  return (
    <FilterButton id={id} label={label} {...props}>
      <Popover modal open={opened} onOpenChange={setOpened}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            {formatMonthRange(value[id])}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col items-start w-auto gap-2">
          <MonthCalendar mode="range" selected={local} onSelect={setLocal} />
          <Button variant="link" className="p-0" onClick={handleApplyValue}>
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </FilterButton>
  )
}

export interface WeekFilterProps extends FilterButtonProps {
  from?: string
  to?: string
}

export function WeekFilter({ from, to, id, label = 'Week', ...props }: WeekFilterProps) {
  const { value, updateValue } = useFilterContext()
  const [opened, setOpened] = useState(false)
  const actualFrom = from ? asMonday(from) : undefined
  const actualTo = to ? add(asMonday(to), { weeks: 1 }) : undefined

  const isSelected = (date: any) => {
    const from = value?.[id]?.from
    return !!from && isWithinInterval(asUtc(date), asWeek(from))
  }

  const handleDayClick = (day: Date) => {
    const week = asWeek(day)
    updateValue(id, asDateRangeValue(week))
    setOpened(false)
  }

  const handlePrevWeek = () => {
    const from = value?.[id]?.from
    if (!from) {
      return
    }
    const prevFrom = add(asUtc(value.from), { weeks: -1 })
    const week = asWeek(prevFrom)
    updateValue(id, asDateRangeValue(week))
  }

  const handleNextWeek = () => {
    if (!from) {
      return
    }
    const prevFrom = add(asUtc(value.from), { weeks: 1 })
    const week = asWeek(prevFrom)
    updateValue(id, asDateRangeValue(week))
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

  return (
    <FilterButton id={id} label={label} {...props}>
      {actualFrom && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={handleFirstWeek}>
              <ChevronFirstIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{format(actualFrom, 'yyyy-MM-dd')}</TooltipContent>
        </Tooltip>
      )}
      <Button size="sm" variant="outline" onClick={handlePrevWeek}>
        <ChevronLeftIcon />
      </Button>
      <Popover modal open={opened} onOpenChange={setOpened}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            {formatWeek(value[id])}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          Month {value?.[id]?.from}
          <Calendar
            mode="single"
            defaultMonth={value?.[id]?.from ? asUtc(value?.[id]?.from) : undefined}
            onDayClick={handleDayClick}
            modifiers={{
              selected: isSelected,
            }}
          />
        </PopoverContent>
      </Popover>
      <Button size="sm" variant="outline" onClick={handleNextWeek}>
        <ChevronRightIcon />
      </Button>
      {actualTo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={handleLastWeek}>
              <ChevronLastIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{format(actualTo, 'yyyy-MM-dd')}</TooltipContent>
        </Tooltip>
      )}
    </FilterButton>
  )
}
