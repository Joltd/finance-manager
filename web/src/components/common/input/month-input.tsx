"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

type MonthInputProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function MonthInput({
  value,
  onChange,
  placeholder = "Выберите месяц",
  disabled = false,
  className,
}: MonthInputProps) {
  const [open, setOpen] = React.useState(false)
  const [year, setYear] = React.useState(() => value?.getFullYear() ?? new Date().getFullYear())

  React.useEffect(() => {
    if (value) setYear(value.getFullYear())
  }, [value])

  const handleSelect = (month: number) => {
    onChange?.(new Date(year, month, 1))
    setOpen(false)
  }

  const selectedYear = value?.getFullYear()
  const selectedMonth = value?.getMonth()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="input"
          variant="outline"
          disabled={disabled}
          aria-haspopup="dialog"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "justify-start font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 opacity-60" />
          {value ? format(value, "MMM yyyy", { locale: ru }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setYear((y) => y - 1)}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm font-medium">{year}</span>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setYear((y) => y + 1)}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((label, i) => {
            const isSelected = selectedYear === year && selectedMonth === i
            return (
              <Button
                key={i}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleSelect(i)}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MonthInput }
export type { MonthInputProps }
