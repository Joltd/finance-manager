import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { FetchStoreState } from '@/store/common/fetch'
import { Spinner } from '@/components/ui/spinner'
import { ErrorLabel } from '@/components/common/error-label'

export interface ReferenceInputProps<T> {
  placeholder?: string
  value?: T
  onChange?: (value?: T) => void
  getId: (it: T) => string
  fetchStore: Pick<
    FetchStoreState<T[]>,
    'loading' | 'dataFetched' | 'updateQueryParams' | 'fetch' | 'data' | 'error'
  >
  queryParams?: Record<string, any>
  onNew?: () => Promise<T>
  renderItem: (item: T) => React.ReactNode
  size?: 'default' | 'sm'
  className?: string
}

export function ReferenceInput<T>({
  placeholder,
  value,
  onChange,
  getId,
  fetchStore,
  queryParams,
  onNew,
  renderItem,
  size = 'default',
  className,
}: ReferenceInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const actualQuery = useDebounce(query, 300)

  useEffect(() => {
    if (open) {
      fetchStore.updateQueryParams({ mask: actualQuery, ...queryParams })
      fetchStore.fetch()
    }
  }, [open, actualQuery])

  const handleSelect = (item: T) => {
    onChange?.(item)
    onOpenChange(false)
  }

  const handleNew = () => {
    onOpenChange(false)
    onNew?.().then((result) => onChange?.(result))
  }

  const handleClear = () => {
    onChange?.(undefined)
    setOpen(false)
  }

  const onOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setQuery('')
    }
  }

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn('w-30 shrink-0 justify-start px-3 py-1', className)}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value ? renderItem(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Command shouldFilter={false} className="gap-4">
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
          <CommandList>
            <ErrorLabel error={fetchStore.error} />
            {fetchStore.dataFetched && <CommandEmpty>Not found</CommandEmpty>}
            {fetchStore.data?.map((it) => (
              <CommandItem key={getId(it)} value={getId(it)} onSelect={() => handleSelect(it)}>
                {renderItem(it)}
                <CheckIcon
                  className={cn('ml-auto', (!value || getId(value) !== getId(it)) && 'opacity-0')}
                />
              </CommandItem>
            ))}
          </CommandList>
          <div className="flex">
            {onNew && (
              <Button variant="link" className="p-0" onClick={handleNew}>
                New
              </Button>
            )}
            <div className="flex-grow" />
            <Button variant="link" className="p-0" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
