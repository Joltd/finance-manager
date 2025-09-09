'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'
import { RangeValue } from '@/types/common'
import { FilterPrimitiveProps } from '@/types/common/filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDate, formatRange } from '@/lib/date'

export interface DateFilterProps extends FilterPrimitiveProps {
  value?: RangeValue<string>
  onChange?: (value: RangeValue<string>) => void
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [opened, setOpened] = useState(false)
  const [local, setLocal] = useState<DateRange | undefined>(value as any)

  const handleApplyValue = () => {
    onChange?.({
      from: formatDate(local?.from as any),
      to: formatDate(local?.to as any),
    })
    setOpened(false)
  }

  return (
    <Popover modal open={opened} onOpenChange={setOpened}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          {formatRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-min">
        <div className="flex gap-2">
          {/*<Button size="sm" variant="ghost">*/}
          {/*  Last month*/}
          {/*</Button>*/}
          {/*<Button size="sm" variant="ghost">*/}
          {/*  Last 3 month*/}
          {/*</Button>*/}
          {/*<Button size="sm" variant="ghost">*/}
          {/*  Last half year*/}
          {/*</Button>*/}
          <div className="grow" />
          <Button
            size="sm"
            variant="secondary"
            disabled={!local?.from || !local?.to}
            onClick={handleApplyValue}
          >
            Apply
          </Button>
        </div>
        <Calendar
          mode="range"
          numberOfMonths={2}
          required
          defaultMonth={local?.from}
          selected={local}
          onSelect={(it) => setLocal(it)}
        />
      </PopoverContent>
    </Popover>
  )
}
