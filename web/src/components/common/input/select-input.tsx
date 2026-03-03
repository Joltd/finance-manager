'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Context ──────────────────────────────────────────────────────────────────

type SelectInputContextValue = {
  value: unknown
  onChange: ((value: unknown) => void) | undefined
  setLabel: (label: string) => void
  setOpen: (open: boolean) => void
}

const SelectInputContext = createContext<SelectInputContextValue | null>(null)

function useSelectInputContext() {
  const ctx = useContext(SelectInputContext)
  if (!ctx) throw new Error('SelectInputOption must be used within SelectInput')
  return ctx
}

// ─── SelectInputOption ────────────────────────────────────────────────────────

type SelectInputOptionProps<T> = {
  id: T
  label: string
}

function SelectInputOption<T>({ id, label }: SelectInputOptionProps<T>) {
  const { value, onChange, setLabel, setOpen } = useSelectInputContext()
  const isSelected = value === id

  const handleSelect = () => {
    onChange?.(id)
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

// ─── SelectInput ──────────────────────────────────────────────────────────────

type SelectInputProps<T> = {
  value?: T
  onChange?: (value: T) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  children?: React.ReactNode
}

function SelectInput<T>({
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  id,
  'aria-invalid': ariaInvalid,
  children,
}: SelectInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (value === undefined || value === null) setLabel('')
  }, [value])

  const contextValue = useMemo<SelectInputContextValue>(
    () => ({
      value,
      onChange: onChange as ((v: unknown) => void) | undefined,
      setLabel,
      setOpen,
    }),
    [value, onChange],
  )

  return (
    <SelectInputContext.Provider value={contextValue}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            id={id}
            data-slot="input"
            type="button"
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className={cn(
              'border-input dark:bg-input/30 flex h-9 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              !label && 'text-muted-foreground',
              className,
            )}
          >
            <span className="truncate">{label || placeholder}</span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </SelectInputContext.Provider>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { SelectInput, SelectInputOption }
export type { SelectInputProps, SelectInputOptionProps }