import { FilterPrimitive } from '@/components/common/filter-proto/filter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { FilterOperator } from '@/types/entity'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { RangeValue } from '@/types/common'
import { DateRange } from 'react-day-picker'
import { add, addDays, Duration, startOfToday } from 'date-fns'
import { prepareRange } from '@/lib/utils'

export interface DateFilterProps extends FilterPrimitive<RangeValue<string | undefined>> {}

interface Preset {
  id: string
  label: string
  operator: FilterOperator
  duration: Duration
}

const afterPreset: Preset = {
  id: 'after',
  label: 'after',
  operator: FilterOperator.GREATER_EQUALS,
  duration: {},
}

const beforePreset: Preset = {
  id: 'before',
  label: 'before',
  operator: FilterOperator.LESS,
  duration: {},
}

const customPreset: Preset = {
  id: 'custom',
  label: 'custom',
  operator: FilterOperator.BETWEEN,
  duration: {},
}

const presets: Preset[] = [
  {
    id: 'today',
    label: 'today',
    operator: FilterOperator.BETWEEN,
    duration: { days: 1 },
  },
  {
    id: 'last-week',
    label: 'last week',
    operator: FilterOperator.BETWEEN,
    duration: { weeks: -1 },
  },
  {
    id: 'last-month',
    label: 'last month',
    operator: FilterOperator.BETWEEN,
    duration: { months: -1 },
  },
  {
    id: 'last-3-month',
    label: 'last 3 month',
    operator: FilterOperator.BETWEEN,
    duration: { months: -3 },
  },
  afterPreset,
  beforePreset,
  customPreset,
]

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [preset, setPreset] = useState<Preset>(presets[0])
  const [value, setValue] = useState<RangeValue<string | undefined>>()
  const [calendarPreset, setCalendarPreset] = useState<Preset>(customPreset)
  const [calendarValue, setCalendarValue] = useState<DateRange>()
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    onFilterChange?.(false, FilterOperator.BETWEEN, value)
  }, [value])

  const handleChangePreset = (preset: Preset) => {
    if (preset.id === 'custom' || preset.id === 'after' || preset.id === 'before') {
      setCalendarPreset(preset)
      setTimeout(() => setOpened(true), 100)
      return
    }

    setPreset(preset)
    const today = startOfToday()
    const other = add(today, preset.duration)
    setValue(prepareRange(today, other))
  }

  const handleApplyValue = () => {
    setPreset(calendarPreset)
    const from = calendarValue?.from
    const to = calendarValue?.to ? addDays(calendarValue.to, 1) : undefined
    setValue(prepareRange(from, to))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="rounded-none">
            {preset.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {presets.map((it) => (
            <DropdownMenuItem key={it.id} onSelect={() => handleChangePreset(it)}>
              {it.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={opened} onOpenChange={setOpened}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Select date</DialogTitle>
          </DialogHeader>
          <div className="flex h-80">
            {calendarPreset.id === 'after' && (
              <Calendar
                mode="single"
                selected={calendarValue?.from}
                onSelect={(it) => setCalendarValue({ from: it, to: undefined })}
                captionLayout="dropdown"
              />
            )}
            {calendarPreset.id === 'before' && (
              <Calendar
                mode="single"
                selected={calendarValue?.to}
                onSelect={(it) => setCalendarValue({ from: undefined, to: it })}
                captionLayout="dropdown"
              />
            )}
            {calendarPreset.id === 'custom' && (
              <Calendar
                mode="range"
                selected={calendarValue}
                onSelect={(it) => setCalendarValue(it)}
                captionLayout="dropdown"
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleApplyValue}>Apply</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
