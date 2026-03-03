'use client'

import * as React from 'react'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type SelectInputContextValue<T = unknown> = {
  value?: T
  onChange?: (value: T) => void
  label: string
  setLabel: (label: string) => void
  setOpen: (open: boolean) => void
}

const SelectInputContext = createContext<SelectInputContextValue | null>(null)

function useSelectInput() {
  const ctx = useContext(SelectInputContext)
  if (!ctx) {
    throw new Error('useSelectInput must be used within SelectInput')
  }
  return ctx
}

type SelectInputOptionProps<T> = {
  id: T
  label: string
}

function SelectInputOption<T>({ id, label }: SelectInputOptionProps<T>) {
  const { value, onChange, setLabel, setOpen } = useSelectInput()
  const isSelected = value === id

  const handleSelect = () => {
    onChange?.(id as unknown as never)
    setLabel(label)
    setOpen(false)
  }

  return (
    <DropdownMenuItem onSelect={handleSelect} className="flex items-center justify-between gap-2">
      {label}
      {isSelected && <CheckIcon className="size-4 shrink-0 opacity-70" />}
    </DropdownMenuItem>
  )
}

// ─── SelectInput ─────────────────────────────────────────────────────────────

type SelectInputProps<T> = {
  value?: T
  onChange?: (value: T) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  children?: ReactNode
}

function SelectInput<T>({
  value,
  onChange,
  placeholder = 'Choose an option',
  disabled = false,
  className,
  children,
}: SelectInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (value === undefined || value === null) {
      setLabel('')
    }
  }, [value])

  const contextValue = useMemo<SelectInputContextValue>(
    () => ({
      value,
      onChange: onChange as ((v: unknown) => void) | undefined,
      label,
      setLabel,
      setOpen,
    }),
    [value, onChange, label],
  )

  return (
    <SelectInputContext.Provider value={contextValue}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            data-slot="input"
            variant="outline"
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              'justify-between font-normal',
              !label && 'text-muted-foreground',
              className,
            )}
          >
            <span className="truncate">{label || placeholder}</span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </SelectInputContext.Provider>
  )
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { SelectInput, SelectInputOption }
export type { SelectInputProps, SelectInputOptionProps }
