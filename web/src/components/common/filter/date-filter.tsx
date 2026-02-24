import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import {
  asDateRangeValue,
  asModelMonthRange,
  asMonday,
  asUtc,
  asVisualMonthRange,
  asWeek,
  formatDate,
  formatDateRange,
  formatMonthRange,
  formatWeek,
} from '@/lib/date'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { MonthCalendar } from '@/components/common/calendar'
import {
  FilterButton,
  FilterButtonProps,
  useFilterActionsContext,
  useFilterStateContext,
} from '@/components/common/filter/filter'
import { add, format, isWithinInterval } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

export interface MonthRangeFilterProps extends FilterButtonProps {}

export function MonthRangeFilter({ id, label = 'Months', ...props }: MonthRangeFilterProps) {
  const [opened, setOpened] = useState(false)
  const { value } = useFilterStateContext()
  const { updateValue } = useFilterActionsContext()
  const [local, setLocal] = useState<DateRange | undefined>(asVisualMonthRange(value[id]))

  useEffect(() => {
    setLocal(asVisualMonthRange(value[id]))
  }, [value[id]])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLocal(asVisualMonthRange(value[id]))
    }
    setOpened(next)
  }

  const handleApplyValue = () => {
    const result = asModelMonthRange(local)
    if (result) {
      updateValue(id, result)
    }
    setOpened(false)
  }

  return (
    <FilterButton id={id} label={label} {...props}>
      <Popover modal open={opened} onOpenChange={handleOpenChange}>
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

export interface DateFilterProps extends FilterButtonProps {}

export function DateFilter({ id, label = 'Date', ...props }: DateFilterProps) {
  const [opened, setOpened] = useState(false)
  const { value } = useFilterStateContext()
  const { updateValue } = useFilterActionsContext()
  const [local, setLocal] = useState<Date | undefined>(value[id] ? asUtc(value[id]) : undefined)

  // Синхронизируем local с внешним value[id] (например, при сбросе фильтров снаружи)
  useEffect(() => {
    setLocal(value[id] ? asUtc(value[id]) : undefined)
  }, [value[id]])

  const handleOpenChange = (next: boolean) => {
    // При закрытии без Apply сбрасываем несохранённый выбор
    if (!next) {
      setLocal(value[id] ? asUtc(value[id]) : undefined)
    }
    setOpened(next)
  }

  const handleApply = () => {
    if (local) {
      updateValue(id, formatDate(local))
    }
    setOpened(false)
  }

  return (
    <FilterButton id={id} label={label} {...props}>
      <Popover modal open={opened} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            {value[id] ? formatDate(asUtc(value[id])) : '—'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col items-start w-auto gap-2">
          <Calendar mode="single" selected={local} onSelect={setLocal} defaultMonth={local} />
          <Button variant="link" className="p-0" onClick={handleApply}>
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </FilterButton>
  )
}

export interface DateRangeFilterProps extends FilterButtonProps {}

export function DateRangeFilter({ id, label = 'Date Range', ...props }: DateRangeFilterProps) {
  const [opened, setOpened] = useState(false)
  const { value } = useFilterStateContext()
  const { updateValue } = useFilterActionsContext()
  const [local, setLocal] = useState<DateRange | undefined>(() =>
    value[id]?.from
      ? { from: asUtc(value[id].from), to: value[id].to ? asUtc(value[id].to) : undefined }
      : undefined,
  )

  useEffect(() => {
    setLocal(
      value[id]?.from
        ? { from: asUtc(value[id].from), to: value[id].to ? asUtc(value[id].to) : undefined }
        : undefined,
    )
  }, [value[id]])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLocal(
        value[id]?.from
          ? { from: asUtc(value[id].from), to: value[id].to ? asUtc(value[id].to) : undefined }
          : undefined,
      )
    }
    setOpened(next)
  }

  const handleApply = () => {
    if (local?.from) {
      const end = local.to ?? local.from
      updateValue(id, asDateRangeValue({ start: local.from, end }))
    }
    setOpened(false)
  }

  return (
    <FilterButton id={id} label={label} {...props}>
      <Popover modal open={opened} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            {formatDateRange(value[id])}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col items-start w-auto gap-2">
          <Calendar mode="range" selected={local} onSelect={setLocal} defaultMonth={local?.from} />
          <Button variant="link" className="p-0" onClick={handleApply}>
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
  const { value } = useFilterStateContext()
  const { updateValue } = useFilterActionsContext()
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
    const prevFrom = add(asMonday(from), { weeks: -1 })
    const week = asWeek(prevFrom)
    updateValue(id, asDateRangeValue(week))
  }

  const handleNextWeek = () => {
    const from = value?.[id]?.from
    if (!from) {
      return
    }
    const prevFrom = add(asMonday(from), { weeks: 1 })
    const week = asWeek(prevFrom)
    updateValue(id, asDateRangeValue(week))
  }

  const handleFirstWeek = () => {
    if (actualFrom) {
      handleDayClick(asUtc(actualFrom))
    }
  }

  const handleLastWeek = () => {
    if (actualTo) {
      handleDayClick(asUtc(actualTo))
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
