'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ask } from '@/store/common/ask-dialog'

// ─── Store facade ─────────────────────────────────────────────────────────────

interface ReferenceStoreFacade<T> {
  data: T[] | undefined
  loading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: () => Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setQueryParams: (params: any) => void
}

// ─── Props ────────────────────────────────────────────────────────────────────

type ReferenceInputProps<T> = {
  useStore: () => ReferenceStoreFacade<T>
  value?: T
  onChange?: (value: T) => void
  getLabel: (item: T) => string
  getId: (item: T) => string | number
  placeholder?: string
  disabled?: boolean
  className?: string
  onNew?: (name: string) => Promise<T>
  newLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

function ReferenceInput<T>({
  useStore,
  value,
  onChange,
  getLabel,
  getId,
  placeholder = 'Select...',
  disabled = false,
  className,
  onNew,
  newLabel = 'New',
}: ReferenceInputProps<T>) {
  const { data, loading, fetch, setQueryParams } = useStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setQueryParams({ mask: undefined })
      void fetch()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setQueryParams({ mask: val || undefined })
      void fetch()
    }, 300)
  }

  const handleSelect = (item: T) => {
    onChange?.(item)
    setOpen(false)
  }

  const handleNew = async () => {
    if (!onNew) return
    const name = await ask({ type: 'string', label: 'Название' })
    if (!name) return
    const created = await onNew(name)
    onChange?.(created)
    setOpen(false)
  }

  const selectedLabel = value !== undefined && value !== null ? getLabel(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
            !selectedLabel && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <div className="flex flex-col">
          {/* Search */}
          <div className="border-b p-2">
            <Input placeholder="Поиск..." value={search} onChange={handleSearchChange} autoFocus />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {loading && <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>}
            {!loading && (!data || data.length === 0) && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No data</div>
            )}
            {!loading &&
              data?.map((item) => {
                const id = getId(item)
                const label = getLabel(item)
                const isSelected = value !== undefined && value !== null && getId(value) === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'font-medium',
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {isSelected && <CheckIcon className="ml-2 size-4 shrink-0 opacity-70" />}
                  </button>
                )
              })}
          </div>

          {/* Create new */}
          {onNew && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleNew}
              >
                <PlusIcon className="size-4" />
                {newLabel}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { ReferenceInput }
export type { ReferenceInputProps }
