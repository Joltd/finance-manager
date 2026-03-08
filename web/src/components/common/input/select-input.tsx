'use client'

import * as React from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
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
  mode: 'register' | 'dropdown'
  value: unknown
  onChange: ((value: unknown) => void) | undefined
  setOpen: (open: boolean) => void
  register: (id: unknown, label: string) => void
  unregister: (id: unknown) => void
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
  const { mode, value, onChange, setOpen, register, unregister } = useSelectInputContext()

  useEffect(() => {
    register(id, label)
    return () => unregister(id)
  }, [id, label, register, unregister])

  if (mode === 'register') return null

  const isSelected = value === id
  const handleSelect = () => {
    onChange?.(id)
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
  const [registry, setRegistry] = useState<Map<unknown, string>>(new Map())

  const register = useCallback((optId: unknown, optLabel: string) => {
    setRegistry((prev) => {
      if (prev.get(optId) === optLabel) return prev
      return new Map(prev).set(optId, optLabel)
    })
  }, [])

  const unregister = useCallback((optId: unknown) => {
    setRegistry((prev) => {
      if (!prev.has(optId)) return prev
      const next = new Map(prev)
      next.delete(optId)
      return next
    })
  }, [])

  const label = value !== undefined && value !== null ? (registry.get(value) ?? '') : ''

  const registerCtx: SelectInputContextValue = {
    mode: 'register',
    value,
    onChange: onChange as ((v: unknown) => void) | undefined,
    setOpen,
    register,
    unregister,
  }

  const dropdownCtx: SelectInputContextValue = {
    mode: 'dropdown',
    value,
    onChange: onChange as ((v: unknown) => void) | undefined,
    setOpen,
    register,
    unregister,
  }

  return (
    <>
      {/*Hidden layer — always mounted so options register their id→label mapping */}
      <SelectInputContext.Provider value={registerCtx}>
        <div style={{ display: 'none' }} aria-hidden="true">
          {children}
        </div>
      </SelectInputContext.Provider>

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
        <SelectInputContext.Provider value={dropdownCtx}>
          <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            {children}
          </DropdownMenuContent>
        </SelectInputContext.Provider>
      </DropdownMenu>
    </>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { SelectInput, SelectInputOption }
export type { SelectInputProps, SelectInputOptionProps }
