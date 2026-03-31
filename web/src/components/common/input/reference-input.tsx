import * as React from 'react'
import { useState } from 'react'
import { CheckIcon, ChevronDownIcon, PlusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ask } from '@/store/common/ask-dialog'
import { useDebounce } from '@/hooks/use-debounce'

type ReferenceInputBaseProps<T> = {
  loading?: boolean
  data?: T[]
  onSearch?: (val: string) => void
  getLabel: (item: T) => string
  getId: (item: T) => string | number
  placeholder?: string
  disabled?: boolean
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  onNew?: (name: string) => Promise<T>
  newLabel?: string
}

export type ReferenceInputSingleProps<T> = ReferenceInputBaseProps<T> & {
  mode?: 'single'
  value?: T
  onChange?: (value: T) => void
}

export type ReferenceInputMultiProps<T> = ReferenceInputBaseProps<T> & {
  mode: 'multi'
  value?: T[]
  onChange?: (value: T[]) => void
}

export type ReferenceInputProps<T> = ReferenceInputSingleProps<T> | ReferenceInputMultiProps<T>

export function ReferenceInput<T>(props: ReferenceInputProps<T>) {
  const {
    loading,
    data,
    onSearch,
    getLabel,
    getId,
    placeholder = 'Select...',
    disabled = false,
    className,
    'aria-invalid': ariaInvalid,
    onNew,
    newLabel = 'New',
  } = props

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setSearch('')
      onSearch?.('')
    }
  }

  const debouncedSearch = useDebounce((val: string) => {
    onSearch?.(val)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    debouncedSearch(val)
  }

  const isMulti = props.mode === 'multi'

  const isSelected = (item: T): boolean => {
    const id = getId(item)
    if (isMulti) {
      return (props.value ?? []).some((v) => getId(v) === id)
    }
    return props.value != null && getId(props.value) === id
  }

  const handleSelect = (item: T) => {
    if (isMulti) {
      const current = props.value ?? []
      const id = getId(item)
      const exists = current.some((v) => getId(v) === id)
      props.onChange?.(exists ? current.filter((v) => getId(v) !== id) : [...current, item])
    } else {
      props.onChange?.(item)
      setOpen(false)
    }
  }

  const handleNew = async () => {
    if (!onNew) return
    const name = await ask({ type: 'string', label: 'Name' })
    if (!name) return
    const created = await onNew(name)
    if (isMulti) {
      props.onChange?.([...(props.value ?? []), created])
    } else {
      props.onChange?.(created)
    }
    setOpen(false)
  }

  const triggerLabel = isMulti
    ? props.value?.length
      ? props.value.map(getLabel).join(', ')
      : undefined
    : props.value != null
      ? getLabel(props.value)
      : undefined

  const hasValue = isMulti ? (props.value?.length ?? 0) > 0 : props.value != null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          data-slot="input"
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            'justify-between font-normal',
            !hasValue && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{triggerLabel ?? placeholder}</span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <div className="flex flex-col">
          {/* Search */}
          {onSearch && (
            <div className="border-b p-2">
              <Input
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
          )}

          {/* Selected items (shown when onSearch is used, so they're always visible) */}
          {onSearch && isMulti && (props.value?.length ?? 0) > 0 && (
            <>
              <div className="max-h-32 overflow-y-auto">
                {props.value!.map((item) => {
                  const id = getId(item)
                  const label = getLabel(item)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="truncate">{label}</span>
                      <CheckIcon className="ml-2 size-4 shrink-0 opacity-70" />
                    </button>
                  )
                })}
              </div>
              <div className="border-t" />
            </>
          )}

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {loading && <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>}
            {!loading && (!data || data.length === 0) && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No data</div>
            )}
            {!loading &&
              data
                ?.filter((item) => !(onSearch && isMulti && isSelected(item)))
                .map((item) => {
                  const id = getId(item)
                  const label = getLabel(item)
                  const selected = isSelected(item)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                        selected && 'font-medium',
                      )}
                    >
                      <span className="truncate">{label}</span>
                      {selected && <CheckIcon className="ml-2 size-4 shrink-0 opacity-70" />}
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
