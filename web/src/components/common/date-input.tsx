import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { formatDate, parseDate } from '@/lib/utils'

export interface DateInputProps {
  placeholder?: string
  value?: string
  onChange?: (value?: string) => void
}

export function DateInput({ placeholder, value, onChange }: DateInputProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start px-3 py-1">
          {value || placeholder || 'Select date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          selected={parseDate(value)}
          onSelect={(date) => {
            onChange?.(formatDate(date))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
