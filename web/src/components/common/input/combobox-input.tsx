'use client'

import * as React from 'react'
import { useRef } from 'react'
import { CheckIcon, ChevronDownIcon, Loader2Icon, PlusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  COMBOBOX_CREATE_KEY,
  useCombobox,
  UseComboboxOptions,
} from '@/components/common/input/use-combobox'

export type { ComboboxGroup } from '@/components/common/input/use-combobox'

export interface ComboboxValueContext {
  /** Key of the first static group containing the value */
  group?: string
}

export type ComboboxInputProps<T> = Omit<UseComboboxOptions<T>, 'onSelect'> & {
  value?: T
  onChange?: (value: T) => void
  /** Trigger content for the selected value, defaults to the label */
  renderValue?: (value: T, context: ComboboxValueContext) => React.ReactNode
  placeholder?: React.ReactNode
  searchPlaceholder?: string
  createLabel?: (query: string) => React.ReactNode
  size?: 'default' | 'sm'
  disabled?: boolean
  className?: string
  id?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

export function ComboboxInput<T>({
  value,
  onChange,
  renderValue,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  createLabel = (query) => `Create "${query}"`,
  size = 'default',
  disabled = false,
  className,
  id,
  'aria-invalid': ariaInvalid,
  ...options
}: ComboboxInputProps<T>) {
  const { getId, getLabel, groups } = options
  const inputRef = useRef<HTMLInputElement>(null)
  const combobox = useCombobox<T>({
    ...options,
    onSelect: (item) => onChange?.(item),
  })

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (combobox.open) return
    const printable = e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey
    if (printable) {
      e.preventDefault()
      combobox.setOpen(true, e.key)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      combobox.setOpen(true)
    }
  }

  const handleOpenAutoFocus = (e: Event) => {
    // focus manually to put the caret after the character typed on the trigger
    e.preventDefault()
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }

  const isSelected = (item: T) => value != null && getId(value) === getId(item)

  const renderItem = (item: T, key: string, meta?: React.ReactNode) => (
    <CommandItem key={key} value={key} onSelect={combobox.select}>
      <span className="flex-1 truncate">{getLabel(item)}</span>
      {meta}
      <CheckIcon className={cn('size-4', !isSelected(item) && 'invisible')} />
    </CommandItem>
  )

  const renderedGroups = combobox.groups.filter((it) => it.loading || it.options.length > 0)
  const nothingFound = renderedGroups.length === 0 && !combobox.canCreate

  const valueGroup =
    value != null
      ? groups.find((group) => group.items?.some((item) => getId(item) === getId(value)))?.key
      : undefined

  return (
    <Popover open={combobox.open} onOpenChange={(next) => combobox.setOpen(next)}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          data-slot="input"
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={combobox.open}
          aria-invalid={ariaInvalid}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            'dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            'justify-between gap-1.5 font-normal',
            size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 text-base md:text-sm',
            value == null && 'text-muted-foreground',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            {value != null
              ? (renderValue?.(value, { group: valueGroup }) ?? getLabel(value))
              : placeholder}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-64 p-0"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <Command
          shouldFilter={false}
          loop
          value={combobox.active}
          onValueChange={combobox.setActive}
          onKeyDown={combobox.handleKeyDown}
        >
          <CommandInput
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={combobox.query}
            onValueChange={combobox.setQuery}
          />
          <CommandList
            onWheel={(e) => {
              e.currentTarget.scrollTop += e.deltaY
            }}
          >
            {renderedGroups.map(({ group, loading, options: groupOptions }, index) => (
              <CommandGroup
                key={group.key}
                heading={group.label}
                className={cn(index > 0 && 'border-t')}
              >
                {loading ? (
                  <div className="text-muted-foreground px-2 py-1.5 text-sm">Searching...</div>
                ) : (
                  groupOptions.map(({ key, item }) => renderItem(item, key, group.renderMeta?.(item)))
                )}
              </CommandGroup>
            ))}

            {nothingFound && (
              <div className="text-muted-foreground py-6 text-center text-sm">No results</div>
            )}

            {combobox.canCreate && (
              <CommandGroup className={cn(renderedGroups.length > 0 && 'border-t')}>
                <CommandItem
                  value={COMBOBOX_CREATE_KEY}
                  onSelect={combobox.select}
                  disabled={combobox.createDisabled}
                >
                  {combobox.creating ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                  <span className="flex-1 truncate">{createLabel(combobox.query.trim())}</span>
                  <CommandShortcut>Ctrl+↵</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
