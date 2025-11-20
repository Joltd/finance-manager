import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button, buttonVariants } from '@/components/ui/button'
import React, { Fragment, useEffect, useState } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { FetchStoreState } from '@/store/common/fetch'
import { Spinner } from '@/components/ui/spinner'
import { ErrorLabel } from '@/components/common/typography/error-label'
import type { VariantProps } from 'class-variance-authority'
import { Typography } from '@/components/common/typography/typography'
import { Chip } from '@/components/common/chip'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'

export type Mode = 'single' | 'multiple'

export interface BaseProps<T>
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  mode: Mode
  placeholder?: string
  getId: (it: T) => string
  fetchStore: Pick<
    FetchStoreState<T[]>,
    'loading' | 'dataFetched' | 'updateQueryParams' | 'fetch' | 'data' | 'error' | 'reset'
  >
  queryParams?: Record<string, any>
  onNew?: () => Promise<T>
  renderItem: (item: T) => React.ReactNode
}

export interface SingleProps<T> {
  mode: 'single'
  value?: T
  onValueChange?: (value?: T) => void
}

export interface MultipleProps<T> {
  mode: 'multiple'
  value?: T[]
  onValueChange?: (value?: T[]) => void
}

export type ReferenceInputProps<T> = BaseProps<T> & (SingleProps<T> | MultipleProps<T>)

export function ReferenceInput<T>({
  mode,
  placeholder,
  value,
  onValueChange,
  getId,
  fetchStore,
  queryParams,
  onNew,
  renderItem,
  className,
  ...props
}: ReferenceInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const actualQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!open) {
      return
    }

    fetchStore.updateQueryParams({ mask: actualQuery, ...queryParams })

    if (!actualQuery) {
      fetchStore.reset()
    } else {
      fetchStore.fetch()
    }
  }, [open, actualQuery])

  const select = (item: T) => {
    if (mode === 'multiple') {
      const filtered = value?.filter((it) => getId(it) !== getId(item)) || []
      if (filtered.length !== (value?.length || 0)) {
        onValueChange?.(filtered)
      } else {
        onValueChange?.([...filtered, item])
      }
    } else if (mode === 'single') {
      onValueChange?.(item)
    }
  }

  const handleSelect = (item: T) => {
    select(item)
    if (mode === 'single') {
      onOpenChange(false)
    }
  }

  const handleNew = () => {
    onOpenChange(false)
    onNew?.().then((result) => select(result))
  }

  const handleClear = () => {
    if (mode === 'multiple') {
      onValueChange?.([])
    } else if (mode === 'single') {
      onValueChange?.(undefined)
    }
  }

  const onOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setQuery('')
    }
  }

  const renderLabel = () => {
    if (mode === 'multiple') {
      return !value?.length
        ? placeholder
        : value.length === 1
          ? renderItem(value[0])
          : `${value.length} selected`
    } else if (mode === 'single') {
      return value ? renderItem(value) : placeholder
    } else {
      return placeholder
    }
  }

  const isSelected = (item: T) => {
    if (mode === 'multiple') {
      return !!value?.filter((it) => getId(it) === getId(item))?.length
    } else if (mode === 'single') {
      return !!value && getId(value) === getId(item)
    } else {
      return false
    }
  }

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-30 shrink-0 justify-start px-3 py-1', className)}
          {...props}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>{renderLabel()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Command shouldFilter={false} className="gap-4 max-h-80">
          <div className="relative">
            <CommandInput placeholder="Search" value={query} onValueChange={setQuery} />
            <div className="absolute top-0 bottom-0 right-0 flex items-center">
              {fetchStore.loading && <Spinner />}
              {!!query && (
                <Button size="sm" variant="ghost" onClick={() => setQuery('')}>
                  <XIcon />
                </Button>
              )}
            </div>
          </div>
          {fetchStore.dataFetched && (
            <CommandList>
              <ErrorLabel error={fetchStore.error} />
              <CommandEmpty>Not found</CommandEmpty>
              {fetchStore.data?.map((it) => (
                <CommandItem key={getId(it)} value={getId(it)} onSelect={() => handleSelect(it)}>
                  <div className="grow truncate">{renderItem(it)}</div>
                  <CheckIcon className={cn('shrink-0', !isSelected(it) && 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandList>
          )}
          {mode === 'multiple' && !!value?.length && (
            <Flow scrollable>
              {value.map((it) => (
                <Chip key={getId(it)} onDismiss={() => handleSelect(it)}>
                  {renderItem(it)}
                </Chip>
              ))}
            </Flow>
          )}
          <Stack orientation="horizontal">
            {onNew && (
              <div className="grow">
                <Button variant="link" className="p-0" onClick={handleNew}>
                  New
                </Button>
              </div>
            )}
            {(!!value || (Array.isArray(value) && !!value?.length)) && (
              <div className="flex grow justify-end">
                <Button variant="link" className="p-0" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            )}
          </Stack>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
