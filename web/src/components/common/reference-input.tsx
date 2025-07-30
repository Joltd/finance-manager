import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Reference } from '@/types/common'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { CheckIcon, Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { FetchStoreState } from '@/store/common/fetch'

export interface ReferenceSelectProps {
  store: FetchStoreState<Reference[]>
  placeholder?: string
  value?: Reference
  onChange?: (value?: Reference) => void
}

export function ReferenceInput({ store, placeholder, value, onChange }: ReferenceSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const actualQuery = useDebounce(query, 300)

  useEffect(() => {
    store.updateQueryParams({ mask: actualQuery ? actualQuery : undefined })
    store.fetch()
  }, [actualQuery, store])

  const changePopoverOpen = (open: boolean) => {
    setOpen(open)
    if (open) {
      store.updateQueryParams({ mask: undefined })
      store.fetch()
    }
  }

  return (
    <Popover modal open={open} onOpenChange={changePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">{value?.name || placeholder || 'Select'}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command shouldFilter={false} className="gap-4">
          <div className="relative flex">
            <CommandInput placeholder="Search" onValueChange={setQuery} />
            <Loader2Icon className="absolute top-0 right-0 animate-spin" />
          </div>
          <CommandList>
            <CommandEmpty>Not found</CommandEmpty>
            {store.data?.map((it) => (
              <CommandItem
                key={it.id}
                value={it.id}
                onSelect={() => {
                  onChange?.(it)
                  changePopoverOpen(false)
                }}
              >
                {it.name}
                <CheckIcon className={cn('ml-auto', value?.id !== it.id && 'opacity-0')} />
              </CommandItem>
            ))}
          </CommandList>
          <div>
            <Button variant="link">New</Button>
            <Button variant="link">Clear</Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
